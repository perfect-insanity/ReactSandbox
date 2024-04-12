import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import fsp from 'fs/promises';
import session from 'express-session';

const host = 'localhost';
const port = 8000;
const clientBuildPath = '../frontend/build';
const clientBuildDir = path.dirname(fileURLToPath(import.meta.url));
const userDataFileName = './backend/data/users.json';
const secret = 'qwerty';

const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

async function readDataFile() {
    var json = [];
    try {
        const data = await fsp.readFile(userDataFileName);
        json = JSON.parse(data);
    }
    catch (err) {
        try {
            await fsp.writeFile(userDataFileName, '[]');
        }
        catch (err) {
            if (err) {
                throw err;
            }
        }
        console.log("The file was saved!");
    }

    return json;
}

app.use(express.static(path.resolve(clientBuildDir, clientBuildPath)));

app.use(
    session({
        secret: secret,
        saveUninitialized: true,
        resave: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
)

app.get('/profile.json', (req, res) => {
    console.log('/profile.json', req.body);
    (async () => {
        const json = await readDataFile();
        const profiles = json.filter((el) => el.email == req.session.user);
        if (profiles.length == 1) {
            let profileData = profiles[0];
            console.log(profileData);
            res.status(200).json(profileData);
        }
    })()
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildDir, clientBuildPath, 'index.html'));
});

app.post('/reg', urlencodedParser, (req, res) => {
    console.log('/reg', req.body);
    (async () => {
        try {
            const json = await readDataFile();

            const found = json.filter((el) => el.email == req.body.email/* || el.phone == req.body.phone*/);

            if (found.length > 0) {
                res.status(401).send(found);
                return;
            }

            json.push(req.body);
            await fsp.writeFile(userDataFileName, JSON.stringify(json));
            req.session.user = req.body.email;

            res.status(200).send();
        }
        catch (err) {
            res.status(500).send(err);
        }
    })()
})

app.post('/login', urlencodedParser, (req, res) => {
    console.log('/login', req.body);
    (async () => {
        try {
            const json = await readDataFile();

            const found = json.filter((el) => el.email == req.body.email && el.password == req.body.password);

            if (found.length == 0) {
                res.status(401).send();
                return;
            }

            req.session.user = req.body.email;
            res.status(200).send(found);
        }
        catch (err) {
            res.status(500).send(err);
        }
    })()

})

app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});