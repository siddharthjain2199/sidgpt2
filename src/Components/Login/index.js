// Login.js
import { Link, Navigate } from 'react-router-dom'
import { useState, useReducer, useContext } from 'react';
import { userReducer, initialState } from '../../data/reducers/userReducer';
import { signInWithEmailAndPassword } from '../../Libs/firebaseutils';
import { AuthContext } from '../../Context/userContext';

const Login = () => {
    const [loginInput, setLoginInput] = useState({ email: '', password: '' });
    const [state, dispatch] = useReducer(userReducer, initialState);

    const handleLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(loginInput.email, loginInput.password, dispatch)
    };

    const handleEmail = (e) => setLoginInput({ ...loginInput, email: e.target.value })
    const handlePassword = (e) => setLoginInput({ ...loginInput, password: e.target.value })
    const { currentUser } = useContext(AuthContext);

    return (
        <div>
            {state.error && <>
                <div className='alert alert-danger alert-dismissible fade show'>
                    {state.error}
                </div>
                <br></br>
            </>}
            {currentUser ? (
                <>
                    <Navigate to="/" />
                </>
            ) : (
                <>
                    <section className='container mx-auto p-5 fixed inset-0 mt-3'>
                        <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
                            <div className="p-5 pb-8 flex-grow overflow-auto">
                                <div className="container bg-transparent text-light">
                                    <h2 className='text-center mb-3'>Login</h2>
                                    <hr />
                                    <form onSubmit={handleLogin}>
                                        <div className="form-group row ">
                                            <label className="col-sm-2 col-form-label">
                                                Email:
                                            </label>
                                            <div className='col-sm-5'>
                                                <input type="email" className='form-control bg-transparent text-light' value={loginInput.email} onChange={handleEmail} />
                                            </div>
                                        </div>
                                        <div className="form-group row mt-3">
                                            <label className="col-sm-2 col-form-label">
                                                Password:
                                            </label>
                                            <div className='col-sm-5'>
                                                <input type="password" className='form-control bg-transparent text-light' value={loginInput.password} onChange={handlePassword} />
                                            </div>
                                        </div>
                                        <div className="form-group mt-3">
                                            <button className='btn btn-warning' type="submit">Login</button>
                                        </div>
                                    </form>
                                    <div>
                                        Not have an account
                                        <Link className='btn btn-link' to='/signup'>Signup</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>

            )}
        </div>
    );
};

export default Login;
