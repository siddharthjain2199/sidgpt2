import { auth, fs } from '../Config/Config';
import userTypes from '../data/types/userTypes';

export const signUpWithEmailAndPassword = async (displayName, email, password, dispatch) => {
    const createUser = (user) => {
        const { displayName, email } = user;
        dispatch({ type: userTypes.SET_USER, payload: { displayName: displayName, email } });
    };
   await auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        fs.collection('users').doc(userCredential.user.uid).set({
            UserName: displayName,
            Email: email,
            Password: password
        })
        dispatch({ type: userTypes.REGISTER });
        createUser(userCredential.user);
        auth.currentUser.updateProfile({ displayName: displayName });
    })
    .catch((error) => {
        let errorString = error.message;
        errorString = errorString.replace("Firebase: ", "");
        errorString = errorString.replace(/ \(auth\/.*?\)\./, "");
        dispatch({ type: userTypes.REGISTER_ERROR, payload: { message: errorString } });
    });
};

export const signInWithEmailAndPassword = async (email, password, dispatch) => {
    const retrieveUser = (user) => {
        const { displayName, email } = user;
        dispatch({ type: userTypes.SET_USER, payload: { displayName: displayName, email } });
    };
    await auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        dispatch({ type: userTypes.LOGIN });
        retrieveUser(userCredential.user);
    })
    .catch((error) => {
        let errorString = error.message;
        errorString = errorString.replace("Firebase: ", "");
        errorString = errorString.replace(/ \(auth\/.*?\)\./, "");
        dispatch({ type: userTypes.LOGIN_ERROR, payload: errorString });
    });
};

export const signOutWithEmailAndPassword = async (dispatch) => {
    auth.signOut().then(() => {
            dispatch({ type: userTypes.LOGOUT });
        });
};


export const handleForgotPassword = async (email,dispatch) => {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        // Password reset email sent successfully
        // console.log("succesfully send email");
        dispatch({ type: userTypes.FORGOT_ERROR, payload: { message: `Reset password sent to your Email ${email}` } });
      })
      .catch(error => {
        // Handle errors here
        let errorString = error.message;
        errorString = errorString.replace("Firebase: ", "");
        errorString = errorString.replace(/ \(auth\/.*?\)\./, "");
        dispatch({ type: userTypes.FORGOT_ERROR, payload: { message: errorString } });
      });
  }