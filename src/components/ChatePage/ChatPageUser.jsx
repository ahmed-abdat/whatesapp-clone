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
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  getDocs,
  where,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import SpinerLoader from "../SpinerLoader";
import useUser from "../../store/useUser";
import ViewChatSound from '../../assets/sounds/viewMessage.mp3'
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
  const lastSeen = getSelectedUser()?.lastSeen.seconds * 1000;
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
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId =
      curretnUserId > selectedUserId
        ? `${curretnUserId + selectedUserId}`
        : `${selectedUserId + curretnUserId}`;
        const chatRef = doc(db, "messages", uniqueChatId);
        getDoc(chatRef).then((doc) => {
          const document = doc.data()
          if(curretnUserId === document.sender){
            updateDoc(chatRef, {
              sender : deleteField()
            })
            .catch((error) => {
              // The document probably doesn't exist.
              console.error("Error updating document: ", error);
            });
          }else {
            updateDoc(chatRef, {
              receiver : deleteField()
            })
            .catch((error) => {
              // The document probably doesn't exist.
              console.error("Error updating document: ", error);
            });
          }
        })
        setIsSelectedUser(false);
        setSelectedUser(null);
    
  };

  const [messages, setMessages] = useState([]);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  // get unique id for chat
  const getUniqueId = () => {
    let timestamp = new Date().getTime().toString(16); // Convert the current time to a hexadecimal string
    let random = Math.random().toString(16).slice(2); // Generate a random number and convert it to a hexadecimal string
    return timestamp + random;
  };

  // make a query to get all unread message from the selected user
  const getUnreadMessage = async () => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId =
      curretnUserId > selectedUserId
        ? `${curretnUserId + selectedUserId}`
        : `${selectedUserId + curretnUserId}`;

    const collectionRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(
      collectionRef,
      where("isRead", "==", false),
      where("from", "==", curretnUserId)
    );
    getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          updateDoc(doc.ref, {
            isRead: true,
          })
            .catch((error) => {
              console.error("Error updating document: ", error);
            });
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
       // update last message read in both user lastMessage collection
       const currentUserLastMessageRef = collection(
        db,
        "users",
        curretnUserId,
        "lastMessage"
      );
      const selectedUserLastMessageRef = collection(
        db,
        "users",
        selectedUserId,
        "lastMessage"
      );
      updateDoc(doc(currentUserLastMessageRef, selectedUserId) , {
        isRead: true,
      })
      .catch((e)=> {
        console.log(e.message);
      })
      updateDoc(doc(selectedUserLastMessageRef, curretnUserId) , {
        isRead: true,
      })
      .catch((e)=> {
        console.log(e.message);
      })


  };

  // update how is view this chat
  const updateChatView = (uniqueChatId) => {
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      const document = doc.data();
      if(document.sender && document.receiver){
        getUnreadMessage();
      }
        }
    )
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
      const docRef = doc(db , 'messages' , uniqueChatId)
      getDoc(docRef).then((querySnapshot)=> {
        let isReceived = false
        if(querySnapshot.data().sender && querySnapshot.data().receiver) {
         console.log(querySnapshot.data());
         isReceived = true
        const sound = new Audio(ViewChatSound);
        sound.play()
       }
       const messageRef = collection(db, "messages", uniqueChatId, "chat");
       console.log(`is Received value ${isReceived}`);
       const messageData = {
         id: getUniqueId(),
         content: message,
         from: currentUserId,
         to: selectedUserId,
         createdAt: serverTimestamp(),
         isRead: false,
         isReceived : isReceived
       };
        addDoc(messageRef, messageData).then((e) => console.log(e.message))
       // update last message in both user lastMessage collection
       const currentUserLastMessageRef = collection(
         db,
         "users",
         currentUserId,
         "lastMessage"
       );
       const selectedUserLastMessageRef = collection(
         db,
         "users",
         selectedUserId,
         "lastMessage"
       );
      setDoc(doc(currentUserLastMessageRef, selectedUserId), messageData).then((e) => console.log(e.message))
      setDoc(doc(selectedUserLastMessageRef, currentUserId), messageData).then((e) => console.log(e.message))
      }).catch((e) => console.log(e.message))

      updateChatView(uniqueChatId)
    } catch (error) {
      console.log(error.message);
    }
  };

  // update user freinds list
  const updateUserFreindsList = (selectedUserId) => {
    const currentUserId = getCurrentUser().uid;
    const currentUserFreindsListRef = collection( db, "users", currentUserId, "freindsList");
    const selectedUserFreindsListRef = collection( db, "users", selectedUserId, "freindsList"); 
    const currentUserFreindsListDoc = doc(currentUserFreindsListRef, selectedUserId);
    const selectedUserFreindsListDoc = doc(selectedUserFreindsListRef, currentUserId);
    setDoc(currentUserFreindsListDoc, {
      uid: selectedUserId,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    setDoc(selectedUserFreindsListDoc, {
      uid: currentUserId,
    })
    .then(() => {
      console.log("Document successfully written!");
    }
    )
  };


  // handel send message
  const handelSendMessage = (e) => {
    e && e.preventDefault();
    if (message.length > 0 && message.trim().length > 0) {
      const messageData = {
        id: getUniqueId(),
        content: message,
        createdAt: serverTimestamp(),
        isRead: false,
        from: getCurrentUser().uid,
        to: getSelectedUser().uid,
      };
      addMessageTODataBase(message);
      updateUserFreindsList(getSelectedUser().uid);
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
      setIsArabic(true);
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
    setIsMessagesLoaded(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
      setIsMessagesLoaded(false);
    });
    return () => unsubscribe();
  }, [getSelectedUser()]);

  const scrollRef = useRef(null);

  // scroll to bottom when new message send
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //listen to change in selected user
  useEffect(() => {
    const q = query(collection(db, "users"), where("uid", "==", getSelectedUser().uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const user = {...doc.data() , id: doc.id};
        setSelectedUser(user);
      });
    });
    return () => unsubscribe();
  }, []);





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
          <h3>{getSelectedUser()?.displayName || "ahmed"}</h3>
          <p className="f-ar dr">
            {getSelectedUser()?.isOnline ? "متصل الآن" : timeAgo}
          </p>
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
            {isMessagesLoaded && <SpinerLoader />}
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
