import { Link, Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar";


export default function Home() {

  return (
    <>
      <Link to="/welcoome">Login</Link>
      {/* <NavBar /> */}
      <Outlet />
    </>
  );
}
