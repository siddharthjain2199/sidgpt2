import React, { useState, useEffect, createContext } from "react";
import { auth, fs } from "../Config/Config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Set up Firebase authentication listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection('users').doc(user.uid).get().then((snapshot) => {
          setCurrentUser(snapshot.data());
        })
      }
      else {
        setCurrentUser(null);
      }
    });
    // Unsubscribe from listener when component unmounts
    return unsubscribe;
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
