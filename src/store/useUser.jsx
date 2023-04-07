import { doc, setDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";

const useUser = create((set) => ({
  currentUser: {},
  setCurrentUser: async (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    set(() => ({ currentUser: user }));
    const { displayName, email, uid, phoneNumber, photoURL } = user;
    await setDoc(doc(db, "users", uid), {
      email,
      displayName,
      uid,
      phoneNumber,
      photoURL,
      isOnline: false,
    });
  },
}));

export default useUser;
