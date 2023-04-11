import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import useUser from "../store/useUser";
import useSignUp from "../store/useSignUp";
import { useEffect } from "react";

export default function User() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const navigate = useNavigate();

  // set phoneuserVerified
  const setIsPhoneUserVerified = useUser(
    (state) => state.setIsPhoneUserVerified
  );

  // set isEmailUser
  const setIsEmailUser = useUser((state) => state.setIsEmailUser);
  // get isEmailUser
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // get phoneUserVerified
  const getIsPhoneUserVerified = useUser((state) => state.getIsPhoneUserVerified);

  // set phone
  const setPhones = useSignUp((state) => state.setPhones);

  // signout user
  const signOut = () => {
    setCurrentUser(null);
    setIsPhoneUserVerified(false);
    setIsEmailUser(false);
    setPhones("");
    navigate("/welcoome");
  };

  // return to sign up page if ther no user
  useEffect(() => {
    if (!user) {
      navigate("/signUp");
    }else if(!getIsEmailUser() && !getIsPhoneUserVerified()){
      navigate("/signUp");
    }
  }, [user]);
  
  return (
    // show the user data
    <div className="signup--container">
      <h1>user</h1>
      <p>{user?.phoneNumber}</p>
      <p>{user?.email}</p>
      <p>{user?.uid}</p>
      <p>{user?.displayName}</p>
      <img
        src={
          user?.photoURL ||
          "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
        }
        alt=""
        style={{
          width: "10rem",
          height: "10rem",
          borderRadius: "50%",
          objectFit: "cover",
          padding: "1.5rem",
        }}
      />
      <button
        onClick={signOut}
        style={{
          padding: "0.5rem 1.2rem",
          borderRadius: "0.3rem",
          color: "#f6f6f6",
          fontSize: "1rem",
          background: "#179652",
        }}
        className="btn"
      >
        sig out
      </button>
    </div>
  );
}
