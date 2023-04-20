import moment from "moment";
import "moment/locale/ar-sa";
import { useState, useEffect } from "react";
import useSelectedUser from "../../store/useSelectedUser";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import useUser from "../../store/useUser";
import Check from "../svg/Check";

export default function HomePageUser({
  displayName,
  photoURL,
  isOnline,
  lastSeen,
  uid,
  lastMessage,
}) {
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

  const lastSeanMessage = moment(lastMessage?.createdAt);
  const HourAndMinitFormat = lastSeanMessage.format("hh:mm");

  const [timeAgo, setTimeAgo] = useState(HourAndMinitFormat);
  const [UnreadMessages, setUnreadMessages] = useState(0);

  // track the time ago
  useEffect(() => {
    const lastSeanMessage = moment(lastMessage?.createdAt);
    const HourAndMinitFormate = lastSeanMessage.format("hh:mm");
    const interval = setInterval(() => {
      if (HourAndMinitFormate !== timeAgo) {
        setTimeAgo(HourAndMinitFormate);
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastMessage?.createdAt]);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  // get the selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);
  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  const handelSelectedUser = () => {
    setSelectedUser({ displayName, photoURL, isOnline, lastSeen, uid });
    getUnreadMessage(uid);
    howIsView(uid);
    setIsSelectedUser(true);
  };

  // make a query to get all unread message from the selected user
  const getUnreadMessage = async (uid) => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = uid;
    const uniqueChatId =
      curretnUserId > selectedUserId
        ? `${curretnUserId + selectedUserId}`
        : `${selectedUserId + curretnUserId}`;

    const collectionRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(
      collectionRef,
      where("isRead", "==", false),
      where("from", "==", selectedUserId)
    );
    getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          updateLastMessage(curretnUserId, selectedUserId);
          updateDoc(doc.ref, {
            isRead: true,
          });
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  // update isRead to true in the currentUser and selectedUser lastMessage collection
  const updateLastMessage = (curretnUserId, selectedUserId) => {
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
    updateDoc(doc(currentUserLastMessageRef, selectedUserId), {
      isRead: true,
    }).catch((e) => {
      console.log(e.message);
    });
    updateDoc(doc(selectedUserLastMessageRef, curretnUserId), {
      isRead: true,
    }).catch((e) => {
      console.log(e.message);
    });
  };

  // update how view the chat content
  const howIsView = (uid) => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = uid;
    const uniqueChatId =
      currentUserId > selectedUserId
        ? `${currentUserId + selectedUserId}`
        : `${selectedUserId + currentUserId}`;
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      if (doc.exists() && doc.data().hasOwnProperty("sender")) {
        const document = doc.data();
        const isCurrentUserViewThisChat = document.sender === currentUserId;
        if (isCurrentUserViewThisChat) return;
        updateDoc(chatRef, {
          receiver: currentUserId,
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      } else {
        setDoc(chatRef, {
          sender: currentUserId,
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      }
    });
  };

  // is arabic Name
  const isArabic = (str) => {
    const arabic = /[\u0600-\u06FF]/;
    return arabic.test(str);
  };

  // content display class
  const contentClass = () => {
    const isArabic = /[\u0600-\u06FF]/.test(lastMessage?.content);
    const content = lastMessage?.content;
    const maxLength = 50;
    if (isArabic && content?.length > maxLength) {
      return "f-ar dr-ar";
    } else if (isArabic && content?.length < maxLength) {
      return "f-ar";
    } else if (!isArabic && content?.length > maxLength) {
      return "f-en dr-en";
    } else if (!isArabic && content?.length < maxLength) {
      return "f-en";
    }
  };

  // get the  number of unread message from the selected user
  const getUnreadMessageNumber = async (uid) => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = uid;
    const uniqueChatId =
      curretnUserId > selectedUserId
        ? `${curretnUserId + selectedUserId}`
        : `${selectedUserId + curretnUserId}`;
    const collectionRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(
      collectionRef,
      where("isRead", "==", false),
      where("from", "==", selectedUserId)
    );
    const querySnapshot = await getDocs(q);
    let unreadMessages = 0;
    querySnapshot.forEach((doc) => {
      unreadMessages++;
    });
    setUnreadMessages(unreadMessages);
  };

  const isMessageNotRead =
    lastMessage?.isRead === false && lastMessage?.from !== getCurrentUser().uid;
  if (isMessageNotRead) {
    getUnreadMessageNumber(uid);
  }

  return (
    <div className="user--profile" onClick={handelSelectedUser}>
      <div className="user--profile--img">
        <img src={photoURL || defaultAvatar} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
          <h3
            className={`${
              isArabic(displayName) ? "f-ar dr-ar" : "f-en dr-en"
            } ${isMessageNotRead ? "unread-name" : ""}`}
          >
            {displayName || "Ahmed Abdat"}
          </h3>
          {lastMessage?.createdAt && (
            <p
              className={`dr-ar f-ar ${isMessageNotRead ? "unread-color" : ""}`}
            >{`${timeAgo} ${
              lastSeanMessage.format("a") === "am" ? "ص" : "م"
            }`}</p>
          )}
        </div>
        <div className="last-message">
          {lastMessage?.content && (
            <p
              className={`${contentClass()} ${
                isMessageNotRead ? "unread-message-content" : ""
              }`}
            >
              {" "}
              {lastMessage?.content}{" "}
            </p>
          )}
          {isMessageNotRead && <div className="unread">{UnreadMessages}</div>}
          {getCurrentUser()?.uid
            ? lastMessage?.from === getCurrentUser()?.uid && (
                <div
                  className={`${lastMessage?.isRead ? "check" : "uncheck"} d-f`}
                >
                  <Check />
                </div>
              )
            : null}
        </div>
      </div>
    </div>
  );
}
