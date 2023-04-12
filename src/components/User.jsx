import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import useUser from "../store/useUser";
import useSignUp from "../store/useSignUp";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import "./styles/userProfile.css";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useState } from "react";
import Loading from './Loading'

export default function User() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const navigate = useNavigate();

  // state current user
  const [currentUsere, setCurrentUsere] = useState(null);

  // get isEmailUser
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // get phoneUserVerified
  const getIsPhoneUserVerified = useUser(
    (state) => state.getIsPhoneUserVerified
  );

  // set phone
  const setPhones = useSignUp((state) => state.setPhones);

  // signout user
  const signOutes = () => {
    // signout the user
    // update the isOnline property to false
    if(getCurrentUser()?.isOnline){
      updateDoc(doc(db, "users", getCurrentUser().uid), {
        isOnline: false,
      }).catch((error) => {
        console.log(error.message);
      });
    }

    signOut(auth)
      .then(() => {
        setCurrentUser(null);
        console.log("signout succesfully");
      })
      .catch((error) => {
        console.log(error.message);
      });
    localStorage.clear();
    navigate("/welcoome");
  };

  // return to sign up page if ther no user
  useEffect(() => {
    if (!user) {
      navigate("/signUp");
    } else if (!getIsEmailUser() && !getIsPhoneUserVerified()) {
      navigate("/signUp");
    }
  }, [user]);

  // get the current user snapchot 
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        setCurrentUsere(doc.data());
       setCurrentUser(doc.data());
      });
      return unsub;
    }
  }, []);
  return (
    // show the user data
    <div className="signup--container">
    {
      currentUsere ? (  <div className="user-profile">
      <h2>الملف الشخصي</h2>
      <div className="image">
        <img
          className="avatar"
          src={
            currentUsere?.photoURL ||
            "/default-avatar.svg"
          }
          alt="avatar"
        />
        {currentUsere?.isOnline && <div className="online-statue"></div>}
      </div>
      <p> {currentUsere?.displayName} : الإسم </p>
      {currentUsere?.email && <p className="email">{user?.email} : البريد الإلكتروني </p>}
      {currentUsere?.phoneNumber && <p>{user?.phoneNumber} : رقم الهاتف</p>}
      <p>{currentUsere?.isOnline ? 'online' : 'offline'} : الحالة</p>
      <button
        onClick={signOutes}
        style={{
          padding: "0.5rem 1.2rem",
          borderRadius: "0.3rem",
          color: "#f6f6f6",
          fontSize: "1rem",
          background: "#179652",
        }}
        className="btn"
      >
        تسجيل الخروج
      </button>
    </div>) : <Loading />
    }
    </div>
  );
}
