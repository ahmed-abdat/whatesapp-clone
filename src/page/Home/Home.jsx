import { Link, Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar";


export default function Home() {

  return (
    <main className="main--container">
      <Outlet />


    </main>
  );
}
