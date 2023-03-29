import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Context/userContext';
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { auth, fs } from '../../Config/Config';

export const Profile = () => {
    // const [state, dispatch] = useReducer(userReducer, initialState);
    const [editProfile, setEditProfile] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // console.log(state.user)
    const { currentUser } = useContext(AuthContext);
    // if (currentUser) {
    //     console.log(currentUser.UserName);
    // }
    // else {
    //     console.log("login please")
    // }

    const handleEditProfile = () => {
        // console.log("User wants to edit thier details")
        // console.log(editProfile)
        setName(currentUser.UserName)
        setEmail(currentUser.Email)
        setPassword(currentUser.Password)
        setEditProfile(true)
    }
    const user = auth.currentUser;

    const handleEditProfilePopUp = (e) => {
        e.preventDefault();
        // console.log("inside ")
        // console.log(name, email, password)
        if (currentUser.Email !== email) {
            updateEmail(auth.currentUser, email).then(() => {
                // Email updated!
                fs.collection('users').doc(user.uid).update({
                    Email: email
                }).then(() => {
                    // Success! User data updated in Firebase
                    console.log("Email updated!")
                    setEditProfile(false)
                    window.location.reload();
                })
                // ...
            }).catch((error) => {
                // An error occurred
                // ...
                console.log(error)
            });
        } else {
            // console.log("same email")
        }
        if (currentUser.Password !== password) {
            updatePassword(auth.currentUser, password).then(() => {
                // Email updated!
                fs.collection('users').doc(user.uid).update({
                    Password: password
                }).then(() => {
                    // Success! User data updated in Firebase
                    console.log("password updated!")
                    setEditProfile(false)
                    window.location.reload();
                })
                // ...
            }).catch((error) => {
                // An error occurred
                // ...
                console.log(error)
            });
        } else {
            // console.log("same password")
        }
        if (currentUser.Username !== name) {
            updateProfile(auth.currentUser, name).then(() => {
                // Email updated!
                fs.collection('users').doc(user.uid).update({
                    UserName: name
                }).then(() => {
                    // Success! User data updated in Firebase
                    console.log("Name updated!")
                    setEditProfile(false)
                    window.location.reload();
                })
                // ...
            }).catch((error) => {
                // An error occurred
                // ...
                console.log(error)
            });
        } else {
            // console.log("same Name")
        }
    }
    const handleCancel = () => {
        setEditProfile(false)
    }
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () =>
        setPasswordVisible((prevState) => !prevState);
    return (
        <>
         <section className='container mx-auto p-5 fixed inset-0 mt-4'>
            <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
                <div className="p-5 pb-8 flex-grow overflow-auto">

                    <h1 className='text-center bg-transparent text-light'>Profile Page</h1>
                    {currentUser &&
                        <div className="container rounded bg-white mt-1 mb-5 bg-transparent text-light">
                            <div className="row">
                                <div className="col-md-3 border-right">
                                    <div className="d-flex flex-column align-items-center text-center p-3 py-5"><img className="rounded-circle mt-5" width="150px" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png" alt="img" /><span className="font-weight-bold">{currentUser.UserName}</span><span className="text-black-50"></span><span>{currentUser.email}</span></div>
                                </div>
                                <div className="col-md-5 border-right">
                                    <div className="p-3 py-5">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="text-right">Profile Settings</h4>
                                        </div>
                                        {!editProfile ?
                                            <div>
                                                <div className="row mt-2">
                                                    <div className="col-md-6"><label className="labels">Name :&nbsp;</label><span>{currentUser.UserName}</span></div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-12"><label className="labels">Email ID :&nbsp;</label><span>{currentUser.Email}</span></div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="col-md-12"><label className="labels">Password :&nbsp;</label>
                                                        {/* <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="enter Password" value={currentUser.Password} readOnly />
                                                <button onClick={handleTogglePassword}>
                                                    {showPassword ? 'Hide Password' : 'Show Password'}
                                                </button> */}
                                                        <span
                                                            contentEditable={true}
                                                            suppressContentEditableWarning={true}
                                                        >
                                                            {passwordVisible ? currentUser.Password : "********"}
                                                        </span>
                                                        <button className='btn btn-warning m-2' onClick={togglePasswordVisibility}>
                                                            {passwordVisible ? "Hide" : "Show"} Password
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-5 text-center"><button className="btn btn-warning profile-button" type="button" onClick={handleEditProfile}>Edit Profile</button></div>
                                            </div>

                                            :
                                            <div>
                                                <form onSubmit={handleEditProfilePopUp}>
                                                    <div className="row mt-2">
                                                        <div className="col-md-6"><label className="labels">Name</label><input type="text" className="form-control" placeholder="name" value={name} onChange={e => setName(e.target.value)} /></div>
                                                    </div>
                                                    <div className="row mt-3">
                                                        <div className="col-md-12"><label className="labels">Email ID</label><input type="email" className="form-control" placeholder="enter email id" value={email} onChange={e => setEmail(e.target.value)} /></div>
                                                    </div>
                                                    <div className="row mt-3">
                                                        <div className="col-md-12"><label className="labels">Password</label>
                                                            <input type='text' className="form-control" placeholder="enter Password" value={password} onChange={e => setPassword(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="mt-5 text-center">
                                                        <button className="btn btn-warning profile-button" type="submit">Save Profile</button>
                                                        <button className='btn btn-danger m-2' onClick={handleCancel}>Cancel</button>
                                                    </div>
                                                </form>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            </section>
        </>
    )
}
