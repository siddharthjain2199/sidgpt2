import React, { useContext, useReducer } from 'react'
import { Link } from 'react-router-dom'
import { signOutWithEmailAndPassword } from '../../Libs/firebaseutils';

import { userReducer, initialState } from '../../data/reducers/userReducer';
import { AuthContext } from '../../Context/userContext';
import { useTranslation } from 'react-i18next';

function Navbar() {

    const [ dispatch] = useReducer(userReducer, initialState);
    const { t } = useTranslation();
    const handleLogout = async () => {
        await signOutWithEmailAndPassword(dispatch);
    };

    const { currentUser } = useContext(AuthContext);

    return (
        <div style={{ marginBottom: '140px' }}>
            <nav className="navbar navbar-expand-lg fixed-top outline navbar-dark" style={{background: "#1e293b"}}>
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/"><em><b>SidGPT</b></em></Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/about">About Us</Link>
                            </li>
                        </ul>
                        {!currentUser && // <form className="form-inline my-2 my-lg-0 text-light">
                            <ul className="navbar-nav mb-2 mb-lg-0 navbar-right">

                                <li className="nav-item">
                                    <Link className="nav-link" to="/signup">Signup</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                            </ul>
                            // </form>
                        }
                        {currentUser && // <form className="form-inline my-2 my-lg-0 text-light">
                            <ul className="navbar-nav mb-2 mb-lg-0 navbar-right">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile"><em>{t('hello')}, {currentUser.UserName}</em></Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login" onClick={handleLogout}>Logout</Link>
                                </li>
                            </ul>
                            // </form>
                        }
                    </div>
                </div>
            </nav >
        </div >
    )
}

export default Navbar
