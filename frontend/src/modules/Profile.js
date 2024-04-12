import { useState, useEffect } from 'react';

export const Profile = () => {
    const [profileData, setProfileData] = useState({});
    useEffect(() => {
        (async () => {
            const res = await fetch('/profile.json', {
                method: "get"
            });

            console.log(res.status);
            if (res.status === 200) {
                setProfileData((await res.json()));
            }
        })();
    }, []);

    let tableRows = [];

    for (const [k, v] of Object.entries(profileData)) {
        tableRows.push(
            <tr key={k}>
                <td>{k}</td>
                <td>{v}</td>
            </tr>
        )
    }

    return (
        <main>
            <div className='profile-container'>
                <h2>Профиль</h2>
                <table>
                    {tableRows}
                </table>
            </div>
        </main>
    )
}