import useUser from "../store/useUser"

export default function User() {
    const users = useUser((state) => state.users)
    console.log(users);
  return (
    <div className="signup--container">
        <h1>user</h1>
        <p>{users.phoneNumber}</p>
        <p>{'hi'}</p>
        <p>{users.email}</p>
        <p>{users.uid}</p>
        <p>{users.displayName}</p>
        <img src={users.photoURL} alt="" />
    </div>
  )
}