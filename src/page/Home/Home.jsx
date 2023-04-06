import { Link, Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { useUserContext } from "../../context/store";

export default function Home() {
  const { user } = useUserContext();

  console.log(user && user.photoURL);
  return (
    <>
      <div className="user-info">
        <h1>{user?.displayName}</h1>
        <h2>{user?.email}</h2>
        <img src={user?.photoURL} alt="avatar" />
        <p>{user?.uid}</p>
      </div>
      {/* <NavBar /> */}
      <Outlet />
    </>
  );
}
