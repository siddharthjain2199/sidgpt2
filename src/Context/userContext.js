import React, { useState, useEffect, createContext } from "react";
import { auth, fs } from "../Config/Config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase authentication listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection('users').doc(user.uid).get().then((snapshot) => {
          setCurrentUser(snapshot.data());
        })
        setLoading(false);
      }
      else {
        setCurrentUser(null);
        setLoading(false)
      }
    });
    // Unsubscribe from listener when component unmounts
    return unsubscribe;
  }, );
  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
