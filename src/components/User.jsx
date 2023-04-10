import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import useUser from "../store/useUser";

export default function User() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const navigate = useNavigate();

  // signout user
  const signOut = () => {
    setCurrentUser(null);
    navigate("/welcoome");
  };

  return (
    // show the user data
    <div className="signup--container">
      <h1>user</h1>
      <p>{user.phoneNumber}</p>
      <p>{user.email}</p>
      <p>{user.uid}</p>
      <p>{user.displayName}</p>
      <img
        src={user.photoURL}
        alt=""
        style={{ width: "10rem", height : '10rem' , borderRadius : '50%' , objectFit : 'cover' , padding: "1.5rem" }}
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
