import { Link, Outlet } from "react-router-dom";
import './home.css'
import useUser from "../../store/useUser";
import {  BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical, HiLockClosed } from "react-icons/hi";

export default function Home() {
  // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  return (
    <div className="large-screen">
      <div className="green-nav"> </div>
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
        <img src="/whatsapp-web.png" alt="" />
        <h3>واتساب ويب</h3>
        <div className="text">
        <p>يمكنك الآن إرسال الرسائل وتلقّيها دون أن يبقى هاتفك متصلاً بالإنترنت.</p>
        <p>استخدم واتساب على ما يصل إلى 4 أجهزة مرتبطة وهاتف واحد في وقت واحد.</p>
        </div>
        <div className="info d-f">
          <HiLockClosed />
          <p>  مشفرة تمامًا بين الطرفين </p>
        </div>
      </div>
    </main>
    </div>
  );
}
