import moment from "moment";
import useSelectedUser from "../store/useSelectedUser";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import "./styles/chatPageUser.css";
import SmileFace from "./svg/SmileFace";
import Options from "./svg/Options";
import Send from './svg/Send'
import Voice from "./svg/Voice";
import { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import ChatImg from '../assets/img/chat-img.png'

export default function ChatPageUser() {
  // navigate 
  const navigate = useNavigate();
  // selectedUser
  const selectedUser = useSelectedUser((state) => state.selectedUser);



  const connectionStatus = () => {
    if (selectedUser?.isOnline) {
      return "متصل الآن";
    } else {
      return moment(selectedUser?.lastSeen).fromNow("DD/MM/YYYY, hh:mm A");
    }
  };

  // is message arabic
  const [isArabic, setIsArabic] = useState(true);

  // message
  const [message, setMessage] = useState("");

  // handel message
  const handelMessage = (e) => {
    const { value } = e.target;
    const isArabic = /[\u0600-\u06FF]/.test(value);
    isArabic ? setIsArabic(true) : setIsArabic(false);

    if(value.length === 0){
      setIsArabic(true)
    }

    setMessage(value);
  };

  // is selected user
  const isSelectedUser = useSelectedUser((state) => state.isSelectedUser);

  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  // set selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);

  // handel back
  const handelBack = () => {
    setIsSelectedUser(false);
    setSelectedUser(null);
  };

  
  return (
      <div className={`chat-page--container ${!isSelectedUser ? 'hide' : ''}`}>
        <header>
            <div className="back" onClick={handelBack}>
            <div className="icon" >
            <BiArrowBack className="r-180" />
            </div>
          <div className="img">
            <img src={selectedUser.photoURL} alt="avatar" />
          </div>
            </div>
          <div className="info">
            <h3>{selectedUser?.displayName}</h3>
            <p>{connectionStatus()}</p>
          </div>
          <div className="icons">
            <div className="icon">
              <HiSearch />
            </div>
            <div className="icon">
              <HiDotsVertical />
            </div>
          </div>
        </header>
        {/* chat container */}
        <div className="chat-content">
          <div className="message--container" style={{ backgroundImage: `url(${ChatImg})` }}>
            <div className="message">
              <div className="message">
                <p>أهلا بك في واتساب</p>
              </div>
              <div className="time">
                <p>12:00</p>
              </div>
            </div>
          </div>
        </div>
        {/* footer */}
        <footer>
          <div className="icons">
            <div className="icon">
              <SmileFace />
            </div>
            <div className="icon">
              <Options />
            </div>
          </div>
          <div className="input">
            <input
              type="text"
              placeholder="اكتب رسالة"
              onChange={handelMessage}
              value={message}
              className={isArabic ? "f-ar" : "f-en dr-en"}
            />
          </div>
         {
          message.length > 0 ? <div className="icon">
          <Send />
          </div> : <div className="icon">
            <Voice />
          </div>
         }
        </footer>
      </div>
  );
}
