import {auth} from '../config/firebase'
import useUser from "../store/useUser"

export default function User() {
  // const user = auth.currentUser;
    const currentUser = useUser((state) => state.currentUser)
    const savedUser = JSON.parse(localStorage.getItem('currentUser'))
    const user = currentUser.email ? currentUser : savedUser
    console.log(user);

    // console.log({displayName , email , uid , phoneNumber , photoURL});

  return (
    // show the user data 
    <div className="signup--container">
        <h1>user</h1>
        <p>{user.phoneNumber}</p>
        <p>{user.email}</p>
        <p>{user.uid}</p>
        <p>{user.displayName}</p>
        <img src={user.photoURL} alt="" />
    </div>
  )
}