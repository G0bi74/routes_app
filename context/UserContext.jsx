import { createContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const [authChecked, setAuthChecked] = useState(false);

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      setUser(userCredential.user);
    } catch (error) {
      throw Error(error.message);
    }
  }

  async function register(email, password) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      await login(email, password);
    } catch (error) {
      throw Error(error.message);
    }
  }

  async function logout() {
    try {
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.log("Błąd wylogowania:", error.message);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, login, register, logout, authChecked }}
    >
      {children}
    </UserContext.Provider>
  );
}
