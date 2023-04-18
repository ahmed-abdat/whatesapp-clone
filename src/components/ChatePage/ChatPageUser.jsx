import moment from "moment";
import useSelectedUser from "../../store/useSelectedUser";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import SmileFace from "../svg/SmileFace";
import Options from "../svg/Options";
import Send from "../svg/Send";
import Voice from "../svg/Voice";
import { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import ChatImg from "../../assets/img/chat-img.png";
import Message from "./Message";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import { useEffect } from "react";
import { useRef } from "react";
import useUser from "../../store/useUser";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import "../styles/chatPageUser.css";

export default function ChatPageUser() {
  // get selected user
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);
  moment.locale("ar_SA");
  moment.updateLocale("ar_SA", {
    relativeTime: {
      future: "في %s",
      past: "منذ %s",
      s: "ثوان",
      ss: "%d ثانية",
      m: "دقيقة",
      mm: "%d دقائق",
      h: "ساعة",
      hh: "%d ساعات",
      d: "يوم",
      dd: "%d أيام",
      M: "شهر",
      MM: "%d أشهر",
      y: "سنة",
      yy: "%d سنوات",
    },
  });
  const now = moment();
  const lastSeen = getSelectedUser()?.lastSeen;
  const lastSeenMoment = moment(lastSeen);

  const HourAndMinitFormat = lastSeenMoment.format("hh:mm");
  const dateFormat = lastSeenMoment.format("DD/MM/YYYY");

  // function to check if the last seen is today or yesterday
  const currentDate = () => {
    if (lastSeenMoment.isSame(now, "day")) {
      return ` آخر ظهور اليوم عند الساعة ${HourAndMinitFormat} ${
        lastSeenMoment.format("a") === "am" ? "ص" : "م"
      }`;
    } else if (lastSeenMoment.isSame(now.clone().subtract(1, "day"), "day")) {
      return `آخر ظهور أمس عند الساعة ${HourAndMinitFormat}`;
    } else {
      return `آخر ظهور بتاريخ ${dateFormat}`;
    }
  };
  // track the time ago
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = currentDate();
      setTimeAgo(currentTime);
    }, 10000);

    return () => clearInterval(interval);
  }, [lastSeen]);

  const [timeAgo, setTimeAgo] = useState(currentDate());

  // is message arabic
  const [isArabic, setIsArabic] = useState(true);

  // message
  const [message, setMessage] = useState("");

  // handel message
  const handelMessage = (e) => {
    const { value } = e.target;
    const isArabic = /[\u0600-\u06FF]/.test(value);
    isArabic ? setIsArabic(true) : setIsArabic(false);

    if (value.length === 0) {
      setIsArabic(true);
    }

    setMessage(value);
  };

  // is selected user
  const isSelectedUser = useSelectedUser((state) => state.isSelectedUser);

  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  // set selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  // handel back
  const handelBack = () => {
    setIsSelectedUser(false);
    setSelectedUser(null);
  };

  const [messages, setMessages] = useState([]);

  // get unique id for chat
  const getUniqueId = () => {
    let timestamp = new Date().getTime().toString(16); // Convert the current time to a hexadecimal string
    let random = Math.random().toString(16).slice(2); // Generate a random number and convert it to a hexadecimal string
    return timestamp + random;
  };
  // handel send message
  const handelSendMessage = (e) => {
    e && e.preventDefault();
    if (message.length > 0 && message.trim().length > 0) {
      const messageData = {
        id : getUniqueId(),
        content: message,
        createdAt: new Date().getTime(),
        isRead: false,
        from: getCurrentUser().uid,
        to: getSelectedUser().uid,
      };
      addMessageTODataBase(message);
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
      setIsArabic(true);
    }
  };


  // add message to database
  const addMessageTODataBase = async (message) => {
    const selectedUserId = getSelectedUser().uid;
    const currentUserId = getCurrentUser().uid;
    const uniqueChatId =
      currentUserId > selectedUserId
        ? `${currentUserId + selectedUserId}`
        : `${selectedUserId + currentUserId}`;
    try {
      const messageRef = collection(db, "messages", uniqueChatId, "chat");
      const messageData = {
        id: getUniqueId(),
        content: message,
        from: currentUserId,
        to: selectedUserId,
        createdAt: new Date().getTime(),
        isRead: false,
      };
      await addDoc(messageRef, messageData);
      // update last message in both user
      const currentUserRef = doc(db, "users", currentUserId);
      const selectedUserRef = doc(db, "users", selectedUserId);
      await updateDoc(currentUserRef, {
        lastMessage: messageData, 
      });
      await updateDoc(selectedUserRef, {
        lastMessage: messageData,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // get messages
  useEffect(() => {
    const selectedUserId = getSelectedUser().uid;
    const currentUserId = getCurrentUser().uid;
    const uniqueChatId =
      currentUserId > selectedUserId
        ? `${currentUserId + selectedUserId}`
        : `${selectedUserId + currentUserId}`;
    const messageRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(messageRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return ()=> unsubscribe();
  }, [getSelectedUser()]);

  const scrollRef = useRef(null);

  // scroll to bottom when new message send
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`chat-page--container ${!isSelectedUser ? "hide" : ""}`}>
      <header>
        <div className="back" onClick={handelBack}>
          <div className="icon">
            <BiArrowBack className="r-180" />
          </div>
          <div className="img">
            <img
              src={getSelectedUser()?.photoURL || defaultAvatar}
              alt="avatar"
            />
          </div>
        </div>
        <div className="info">
          <h3>{getSelectedUser()?.displayName}</h3>
          <p className="f-ar dr">{getSelectedUser()?.isOnline ? "متصل الآن" : timeAgo}</p>
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
        <div
          className="bgi"
          style={{ backgroundImage: `url(${ChatImg})` }}
        ></div>
        <div className="message--container">
          <div className="container">
            {messages.length > 0 &&
              messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  isSender={message.from}
                  createdAt={message.createdAt}
                  isRead={message.isRead}
                />
              ))}
            <div ref={scrollRef}></div>
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
        <form onSubmit={handelSendMessage}>
          <div className="input">
            <input
              type="text"
              placeholder="اكتب رسالة"
              onChange={handelMessage}
              onKeyDown={(e) => {
                e.key === "Enter" && handelSendMessage();
              }}
              value={message}
              className={isArabic ? "f-ar" : "f-en dr-en"}
            />
          </div>
          {message.length > 0 ? (
            <div className="icon">
              <button style={{ all: "unset" }}>
                <Send />
              </button>
            </div>
          ) : (
            <div className="icon">
              <Voice />
            </div>
          )}
        </form>
      </footer>
    </div>
  );
}
