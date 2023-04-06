import { Link, Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar";


export default function Home() {


  console.log(user && user.photoURL);
  return (
    <>
      <Link to="/login">Login</Link>
      {/* <NavBar /> */}
      <Outlet />
    </>
  );
}
