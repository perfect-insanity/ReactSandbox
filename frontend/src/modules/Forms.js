import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { LoggedInContext } from './App';

const FormDataContext = createContext({});

function generateOnSubmit(request, setSubmittedForm, setRequest) {
    return (event) => {
        event.preventDefault();

        setSubmittedForm(event.target);
        setRequest(request);
    }
}

async function postForm(request, setRequest, sumbittedForm, setSubmittedForm, onResult) {
    if (request == null) return;
    console.log(request, sumbittedForm);
    const res = await fetch(request, {
        method: "post",
        body: new URLSearchParams(new FormData(sumbittedForm))
    });

    console.log(res.status);
    setRequest(null);
    setSubmittedForm(null);

    onResult(res);
}

function prepend(s, ...args) {
    let res = [];
    for (let i = 0; i < args.length - 2; i = i + 2) {
        let first = args[i], sep = args[i + 1], last = args[i + 2];
        res.push(s.length > first ? sep : '');
        res.push(s.slice(first, last));
    }

    return res.join('');
}

const LabeledInput = ({ label, invalid, warning, ...props }) => (
    <div className='labeled-input'>
        <div className='labeled-input-header'>
            <label htmlFor={props.id}>{label}</label>
            <div className='error'>{warning}</div>
        </div>
        <input {...props} className="big-text" name={props.id} />
    </div>
)

const RadioInput = ({ label, ...props }) => (
    <div className='labeled-input inline'>
        <input {...props} type='radio' className="big-text" value={props.id} />
        <label htmlFor={props.id}>{label}</label>
    </div>
)

const LabeledInputWithSave = ({ onChangeValidation, onFocusEndValidation, formatValue, patternDesc, ...props }) => {
    const { formData, setFormData } = useContext(FormDataContext);
    const [warning, setWarning] = useState(null);
    const [invalid, setInvalid] = useState(false);
    const [filled, setFilled] = useState(false);

    return (
        <LabeledInput {...props}
            value={(() => {
                if (formData[props.id] == null) return "";

                return formData[props.id];
            })()}
            onChange={(e) => {
                if (props.onChange) props.onChange(e);

                // проводим валидацию каждый раз при изменении
                setWarning(null);
                setInvalid(false);

                const element = e.target;
                // const pointer = element.selectionStart;

                // window.requestAnimationFrame(() => {
                //     element.selectionStart = pointer;
                //     element.selectionEnd = pointer;
                // });

                let v = element.value;

                if (v.length === 0) {
                    setFilled(false);
                    setInvalid(false);
                    setWarning(null);
                }
                else {
                    if (onChangeValidation) {
                        let warnMsg = onChangeValidation(v);
                        if (warnMsg) {
                            setWarning(warnMsg);
                            return;
                        }
                    }
                    else if (props.pattern) {
                        const regExp = new RegExp('^(' + props.pattern + ')?$');
                        if (!regExp.test(v)) {
                            setWarning(patternDesc);
                            return;
                        }
                    }

                    if (onFocusEndValidation) {
                        let warnMsg = onFocusEndValidation(v);

                        if (!warnMsg) {
                            setInvalid(false);
                            setWarning(null);
                        }
                        else if (filled) {
                            setInvalid(true);
                            setWarning(warnMsg);
                        }
                    }

                    if (formatValue) v = formatValue(v);
                }

                setFormData(prev => ({ ...prev, [props.id]: v }));
            }}
            onBlur={e => {
                let v = e.target.value;

                if (!invalid) setWarning(null); // удаляем простое предупреждение при снятии фокуса

                if (v.length === 0) { // если пустое поле, сбрасываем ошибку
                    setFilled(false);
                    setInvalid(false);
                    setWarning(null);
                    return;
                }

                setFilled(true);

                if (onFocusEndValidation) {
                    let warnMsg = onFocusEndValidation(v);
                    if (warnMsg) {
                        setInvalid(true);
                        setWarning(warnMsg);
                        return;
                    }
                }
            }}
            onInvalid={e => {
                e.preventDefault();
                setInvalid(true);
                if (props.required && !formData[props.id]) {
                    setWarning("Заполните это поле");
                    return;
                }
                setWarning(patternDesc ? patternDesc : "Неверный формат");
            }}
            data-invalid={invalid}
            warning={warning}
        />
    )
}

const RadioInputWithSave = (props) => {
    const { formData, setFormData } = useContext(FormDataContext);
    return (
        <RadioInput {...props}
            checked={(() => {
                if (formData[props.name] == null) return props['data-default'] === true;

                return formData[props.name] === props.id;
            })()}
            onChange={(e) => {
                if (props.onChange) props.onChange(e);

                setFormData(prev => ({ ...prev, [props.name]: props.id }));
            }}
        />
    )
}

const PasswordInput = () => (
    <div className='labeled-input'>
        <div className='labeled-input-header'>
            <label htmlFor="password">Пароль</label>
            <div className='forgot-password small-text'>Забыли пароль?</div>
        </div>
        <input type="password" id="password" className="big-text" name="password" required />
    </div>
)

const FormWithValidation = ({ children, onSubmitPressed, onReset, header, buttonText, errorMsg, ...props }) => (
    <form {...props} className="vertical-layout">
        <header className='form-header'>
            <h2>{header}</h2>
            <button type="button" className='clear-form' onClick={onReset}>Очистить</button>
        </header>
        {(() => {
            if (errorMsg != null)
                return <div class="error big-text">{errorMsg}</div>
        })()}
        {children}

        <button type="submit" className="reservation-send big-text" onClick={onSubmitPressed}>{buttonText}</button>
    </form>
)

export const Registration = () => {
    const [validated, setValidated] = useState(false);
    const [request, setRequest] = useState(null);
    const [sumbittedForm, setSubmittedForm] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isEmailDuplicated, setEmailDuplicated] = useState(false);
    const { setLoggedIn } = useContext(LoggedInContext);
    const navigate = useNavigate();
    const storageId = 'registrationFormData';

    const savedData = JSON.parse(localStorage.getItem(storageId));
    const [formData, setFormData] = useState(typeof savedData === 'object' && savedData != null ? savedData : {});

    useEffect(() => {
        postForm(request, setRequest, sumbittedForm, setSubmittedForm, res => {
            const resCode = res.status;
            if (resCode === 200) {
                localStorage.removeItem(storageId);
                setErrorMsg(null);
                setLoggedIn(true);
                navigate("/");
            }
            else if (resCode > 400) {
                window.scrollTo(0, 0)
                if (resCode === 401) {
                    setErrorMsg("Указанные данные уже используются");
                    setEmailDuplicated(true);
                }
                else {
                    setErrorMsg("Что-то пошло не так: " + res.body);
                }
            }
        });
    }, [request, sumbittedForm, setLoggedIn, navigate]);

    useEffect(() => {
        console.log(formData)
        localStorage.setItem(storageId, JSON.stringify(formData));
    }, [formData]);

    function onReset(e) {
        setFormData({});
        setErrorMsg(null);
        setValidated(false);
    }

    return (
        <main className="form-box">
            <FormWithValidation
                onSubmit={generateOnSubmit('/reg', setSubmittedForm, setRequest)}
                onSubmitPressed={() => setValidated(true)}
                onReset={onReset}
                data-validated={validated}
                header="Регистрация"
                buttonText="Отправить"
                errorMsg={errorMsg}>
                <FormDataContext.Provider value={{ formData, setFormData }}>
                    <LabeledInputWithSave type="text" id="name" label="Имя" required
                        pattern="[a-zA-Zа-яА-ЯёЁ\s\-]+" patternDesc="Вводите только буквы, пробел или дефис"
                    />
                    <LabeledInputWithSave type="text" id="surname" label="Фамилия"
                        pattern="[a-zA-Zа-яА-ЯёЁ\s\-]+" patternDesc="Вводите только буквы, пробел или дефис"
                    />
                    <LabeledInputWithSave type="date" id="birthday" label="Дата рождения"
                        min="1900-01-01" max={new Date().toISOString().split('T')[0]} patternDesc="Укажите корректную дату (не раньше 1900 г.)"
                    />
                    <div>
                        <div className='big-text'>Пол</div>
                        <fieldset>
                            <legend hidden>Пол</legend>
                            <RadioInputWithSave id="undefined" name="gender" label="Не указан" data-default />
                            <RadioInputWithSave id="male" name="gender" label="Мужской" />
                            <RadioInputWithSave id="female" name="gender" label="Женский" />
                        </fieldset>
                    </div>
                    <LabeledInputWithSave type="email" id="email" label="Электронная почта"
                        onChange={() => setEmailDuplicated(false)} data-duplicate={isEmailDuplicated} required
                        onChangeValidation={v => {
                            const regExp = /^[^\s]*$/;
                            if (v.length > 0 && !regExp.test(v)) {
                                return "E-mail не должен содержать пробелов";
                            }
                        }}
                        onFocusEndValidation={v => {
                            const regExp = /^[^\s]+@[^\s]+$/;
                            if (!regExp.test(v)) {
                                return "E-mail должен быть формата имя@домен";
                            }
                        }}
                    />
                    <LabeledInputWithSave type="tel" id="phone" label="Телефон"
                        onChangeValidation={v => {
                            const regExp = /^\+?[-()\d\s]*$/;
                            if (v.length > 0 && !regExp.test(v))
                                return "Вводите только цифры";
                        }}
                        onFocusEndValidation={v => {
                            if (v.replaceAll(/\D/g, "").length < 11) {
                                return "Должно быть 11 цифр";
                            }
                        }}
                        formatValue={v => {
                            return prepend(v.replaceAll(/\D/g, ""), 0, '+', 1, ' (', 4, ') ', 7, '-', 9, '-', 11);
                        }}
                    />
                    <LabeledInputWithSave type="password" id="password" label="Пароль" autoComplete="new-password" required
                        onFocusEndValidation={v => {
                            if (v.length < 6) {
                                return "Минимум 6 символов";
                            }
                        }}
                    />
                </FormDataContext.Provider>
            </FormWithValidation>
        </main>
    )
}

export const Login = () => {
    const [validated, setValidated] = useState(false);
    const [request, setRequest] = useState(null);
    const [sumbittedForm, setSubmittedForm] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const { setLoggedIn } = useContext(LoggedInContext);
    const navigate = useNavigate();

    useEffect(() => {
        postForm(request, setRequest, sumbittedForm, setSubmittedForm, res => {
            const resCode = res.status;
            if (resCode === 200) {
                setErrorMsg(null);
                setLoggedIn(true);
                navigate('/');
            }
            else if (resCode === 401) {
                setErrorMsg("Пользователь не найден");
            }
            else if (resCode === 500) {
                setErrorMsg("Что-то пошло не так: " + res.body);
            }
        });
    }, [request, sumbittedForm, setLoggedIn, navigate]);

    return (
        <main className="form-box">
            <FormWithValidation
                onSubmit={generateOnSubmit('/login', setSubmittedForm, setRequest)}
                onSubmitPressed={() => setValidated(true)}
                errorMsg={errorMsg}
                validated={validated}
                header="Вход"
                buttonText="Войти">

                <LabeledInput type="email" id="email" label="Электронная почта" required />
                <PasswordInput />

            </FormWithValidation>
        </main>
    )
}
