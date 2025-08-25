import React, { useState, useEffect, createContext } from "react";
import { auth, fs } from "../Config/Config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = fs.collection("users").doc(user.uid);
          const docSnap = await docRef.get();

          if (docSnap.exists) {
            // 🔹 Merge Auth user object + Firestore user data
            const firestoreData = docSnap.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || firestoreData.UserName,
              ...firestoreData, // includes UserName, limit, lastReset
            });
          } else {
            console.warn("⚠️ No Firestore document for this user");
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            });
          }
        } catch (error) {
          console.error("❌ Error fetching user Firestore doc:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
