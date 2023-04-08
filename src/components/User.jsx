import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import useUser from "../store/useUser";

export default function User() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const navigate = useNavigate()

  // signout user
  const signOut = () => {
    setCurrentUser(null)
    navigate('/welcoome')

  };

  return (
    // show the user data
    <div className="signup--container">
      <h1>user</h1>
      <p>{user.phoneNumber}</p>
      <p>{user.email}</p>
      <p>{user.uid}</p>
      <p>{user.displayName}</p>
      <img src={user.photoURL} alt="" />
      <button onClick={signOut}>sig out</button>
    </div>
  );
}
