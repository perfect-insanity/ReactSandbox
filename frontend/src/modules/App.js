import { useState, createContext, useContext } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ReactComponent as Logo } from '../assets/logo.svg';
import { MainPage } from './MainPage';
import { Registration, Login } from './Forms';
import { Profile } from './Profile';
import '../styles/App.css';

export const LoggedInContext = createContext({});

const SiteHeader = () => {
  const { loggedIn, setLoggedIn } = useContext(LoggedInContext);
  return (
    <header className="main-header">
      <a href="/" className="logo">
        <Logo />
      </a>
      <menu className="header-menu main-links big-text">
        <li>Гастротуры</li>
        <li>Бронирование</li>
        <li>О нас</li>
        <li>Отзывы</li>
        <li>Фотографии</li>
        <li>Контакты</li>
      </menu>
      <menu className="header-menu account-links big-text">
        {loggedIn ?
          <>
            <li><a href="/profile">Профиль</a></li>
            <li><button className='inline-button' onClick={() => setLoggedIn(false)}>Выйти</button></li>
          </> :
          <>
            <li><a href="/reg">Регистрация</a></li>
            <li><a href="/login">Вход</a></li>
          </>
        }
      </menu>
    </header>
  )
}

const SiteFooter = () => (
  <footer>
    <div className="info"><a className="link-1" href="tel:+71234567890">8 (123) 456-78-90</a></div>
  </footer>
)

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <BrowserRouter>
      <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reg" element={<Registration />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <SiteFooter />
      </LoggedInContext.Provider>
    </BrowserRouter>
  )
}

export default App;
