import moment from "moment";
import React from "react";
import "moment/locale/ar-sa";
import { useState, useEffect } from "react";
import useSelectedUser from "../../store/useSelectedUser";
import defaultAvatar from "../../assets/img/anonymous-user.jpg";
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
import receiveMessageSound from "../../assets/sounds/receiveMessage.mp3";
import { BsImageFill } from "react-icons/bs";
import Voice from "../svg/Voice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

export default function HomePageUser({
  displayName,
  photoURL,
  isOnline,
  lastSeen,
  uid,
  lastMessage,
  userStatus
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

  

  const lastSean =  lastMessage.createdAt?.seconds ? lastMessage.createdAt.seconds * 1000 : lastMessage.createdAt ;
  
  const lastSeanMessage = moment(lastSean);
  const HourAndMinitFormat = lastSeanMessage.format("hh:mm");
  
  const [timeAgo, setTimeAgo] = useState(HourAndMinitFormat);
  const [UnreadMessages, setUnreadMessages] = useState(0);
  const [playSound, setPlaySound] = useState(false);
  
  // track the time ago
  useEffect(() => {
    const lastSean =  lastMessage.createdAt?.seconds ? lastMessage.createdAt.seconds * 1000 : lastMessage.createdAt ;
    const lastSeanMessage = moment(lastSean);
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

  // unique chat id
  const uniqueChateId = (currentUserId, selectedUserId) => {
    return currentUserId > selectedUserId
      ? `${currentUserId + selectedUserId}`
      : `${selectedUserId + currentUserId}`;
  }

  // make a query to get all unread message from the selected user
  const getUnreadMessage = async (uid) => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = uid;
    const currentUserChat = collection(db, "users", curretnUserId ,'messages' , selectedUserId, "chat");
    const selectedUserChat = collection(db, "users", selectedUserId ,'messages' , curretnUserId, "chat");
    const q = query(
      currentUserChat,
      where("isRead", "==", false),
      where("to", "==", getCurrentUser().uid)
    );
    const qe = query(
      selectedUserChat,
      where("isRead", "==", false),
      where("to", "==", getCurrentUser().uid)
    );
    getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          updateLastMessage(curretnUserId, selectedUserId);
          updateDoc(doc.ref, {
            isRead: true,
          }).catch((e) => console.log(e.message));
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    getDocs(qe)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          updateLastMessage(curretnUserId, selectedUserId);
          updateDoc(doc.ref, {
            isRead: true,
          }).catch((e) => console.log(e.message));
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
    const uniqueChatId = uniqueChateId(currentUserId, selectedUserId);
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

  // useStatus class
  const useStatusClass = () => {
    const isArabic = /[\u0600-\u06FF]/.test(userStatus);
    const content = userStatus;
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
    const collectionRef = collection(db, "users", curretnUserId ,'messages' , selectedUserId, "chat");
    const q = query(
      collectionRef,
      where("isRead", "==", false),
      where("from", "==", selectedUserId)
    );
    const querySnapshot = await getDocs(q);
    let unreadMessages = 0;
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        unreadMessages++;
      }
    });
    setUnreadMessages(unreadMessages);
  };

  const isMessageNotRead =
    lastMessage?.isRead === false &&
    lastMessage?.from !== getCurrentUser()?.uid;
  if (isMessageNotRead && getCurrentUser()?.uid) {
    getUnreadMessageNumber(uid);
  }

  const receiveMessageSoundPlay = () => {
    try {
      const sound = new Audio(receiveMessageSound);
      if (
        !lastMessage?.isReceived &&
        lastMessage?.from !== getCurrentUser()?.uid
      ) {
        sound.play();
        const q = query(
          collection(db, "users", getCurrentUser()?.uid, "lastMessage")
        );
        getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // update the doc
            updateDoc(doc.ref, {
              isReceived: true,
            }).catch((e) => console.log(e.message));
          });
        });
      }
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      setPlaySound(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (isMessageNotRead && playSound && UnreadMessages > 0) {
      receiveMessageSoundPlay();
    }
  }, [isMessageNotRead, UnreadMessages]);

  const findEmoji = (message) => {
    if(!message || message.length === 0) return
    const words = message.split(/\s+/);
    const urlReg = /https:\/\/cdn\.jsdelivr\.net\/npm\/emoji-datasource-apple\/img\/apple\/64\/[^/]+\.png/gim;
    const newArray = [];
    
    for (const word of words) {
      const urlMatch = word.match(urlReg);
  
      if (urlMatch) {
        newArray.push(<img src={urlMatch[0]} alt={urlMatch[0]} className="emoji" />);
      } else if (newArray.length > 0 && typeof newArray[newArray.length - 1] === 'string') {
        newArray[newArray.length - 1] += ' ' + word;
      } else {
        newArray.push(word);
      }
    }
    
    return newArray
  };


  const newContent = findEmoji(lastMessage.content);

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100"
      onClick={handelSelectedUser}
    >
      {/* Modern Avatar with shadcn/ui */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage 
          src={photoURL || defaultAvatar} 
          alt={displayName || "User avatar"}
          className="object-cover"
        />
        <AvatarFallback className="bg-gray-200 text-gray-600">
          {displayName?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      {/* User Info Section */}
      <div className="flex-1 min-w-0">
        {/* Name and Time Row */}
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              "font-medium text-gray-900 truncate",
              isArabic(displayName) ? "font-arabic text-right" : "text-left",
              isMessageNotRead && UnreadMessages > 0 && "font-bold text-gray-900"
            )}
          >
            {displayName || "Ahmed Abdat"}
          </h3>
          {lastMessage?.createdAt && (
            <span
              className={cn(
                "text-xs flex-shrink-0 ml-2",
                isMessageNotRead && UnreadMessages > 0 
                  ? "text-whatsapp-primary font-medium" 
                  : "text-gray-500"
              )}
            >
              {`${timeAgo} ${lastSeanMessage.format("a") === "am" ? "ص" : "م"}`}
            </span>
          )}
        </div>

        {/* Message Content and Badge Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {/* Read Status Check Mark */}
            {getCurrentUser()?.uid && lastMessage?.from === getCurrentUser()?.uid && (
              <div className={cn(
                "flex-shrink-0",
                lastMessage?.isRead ? "text-blue-500" : "text-gray-400"
              )}>
                <Check />
              </div>
            )}

            {/* Message Content */}
            <div className="truncate flex-1">
              {lastMessage?.content && lastMessage?.media ? (
                <span className="flex items-center gap-1">
                  <BsImageFill className="text-gray-400 w-4 h-4 flex-shrink-0" />
                  <span
                    className={cn(
                      "truncate",
                      contentClass(),
                      isMessageNotRead && UnreadMessages > 0 
                        ? "text-gray-900 font-medium" 
                        : "text-gray-600"
                    )}
                  >
                    {newContent.map((content, index) => (
                      <React.Fragment key={index}>{content} </React.Fragment>
                    ))}
                  </span>
                </span>
              ) : lastMessage?.media ? (
                lastMessage.media?.type?.includes('image') ? (
                  <span className="flex items-center gap-1 text-gray-600">
                    <BsImageFill className="text-gray-400 w-4 h-4" />
                    <span className="font-arabic">صورة</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Voice wh={20} />
                    <span className="font-arabic">مقطع صوتي</span>
                  </span>
                )
              ) : lastMessage?.content ? (
                <p
                  className={cn(
                    "truncate",
                    contentClass(),
                    isMessageNotRead && UnreadMessages > 0 
                      ? "text-gray-900 font-medium" 
                      : "text-gray-600"
                  )}
                >
                  {newContent.map((content, index) => (
                    <React.Fragment key={index}>{content} </React.Fragment>
                  ))}
                </p>
              ) : (
                <p className={cn("text-gray-500 italic truncate", useStatusClass())}>
                  {userStatus}
                </p>
              )}
            </div>
          </div>

          {/* Unread Badge */}
          {isMessageNotRead && UnreadMessages > 0 && (
            <Badge 
              className="bg-whatsapp-primary text-white hover:bg-whatsapp-primary ml-2 min-w-[20px] h-5 flex items-center justify-center"
              variant="default"
            >
              {UnreadMessages}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
