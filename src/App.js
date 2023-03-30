import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from './Components/Home';
import Navbar from './Components/Navbar';
import Signup from './Components/Signup';
import NotFound from './Components/Common/PageNotFound';
import { Profile } from './Components/Profile';
import AboutUs from './Components/AboutUs';
import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';
import Login from './Components/Login';
import ResetPassword from './Components/ResetPassword';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
    <div style={{marginTop:-50}}>
      <BrowserRouter>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about" element={<AboutUs />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route exact path="/about" element={<AboutUs />} />
            <Route path="*" element={<NotFound />} />
            <Route exact path="/resetpassword" element={<ResetPassword />} />
          </Routes>
      </BrowserRouter>
    </div>
  </I18nextProvider>
  );
}

export default App;
