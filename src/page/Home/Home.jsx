import { Link, Outlet } from "react-router-dom";
import './home.css'
import useUser from "../../store/useUser";
import {  BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";

export default function Home() {
  // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  return (
    <main className="main--container">
      {/* home page */}
      <div className="home-page">
        {/* header */}
        <header>
          <div className="header--container">
            <div className="header--logo">
                <img src={getCurrentUser().photoURL || '/default-avatar.svg'} alt="avatar" />
            </div>
            <div className="header--icons">
              <BsFillChatRightTextFill />
              <HiDotsVertical />
            </div>
            </div>
        </header>
      </div>
      {/* chat page */}
      <div className="chat-page">
        <Outlet />
      </div>
    </main>
  );
}
