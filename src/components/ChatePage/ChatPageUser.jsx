import moment from "moment";
import React from "react";
import useSelectedUser from "../../store/useSelectedUser";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import { FaKeyboard } from "react-icons/fa";
import SmileFace from "../svg/SmileFace";
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
  limit,
  startAfter,
} from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import SpinerLoader from "../SpinerLoader";
import useUser from "../../store/useUser";
import useUsers from "../../store/useUsers";
import ViewChatSound from "../../assets/sounds/viewMessage.mp3";
import ViewFullImage from "./ViewFullImage";
import "../styles/chatPageUser.css";
import { BsImageFill } from "react-icons/bs";
import { lazy, Suspense } from "react";
import useMessages from "../../store/useMessages";
import EmojiPicker from "emoji-picker-react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

// lazy loade
const ViewSelectedImage = lazy(() => import("../ViewSelectedImage"));

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
  const lastSeen = getSelectedUser()?.lastSeen?.seconds ? getSelectedUser()?.lastSeen?.seconds * 1000 : getSelectedUser()?.lastSeen;
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
  const [file, setFile] = useState(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imageAndContent, setImageAndContent] = useState(null);

  // is message arabic
  const [isArabic, setIsArabic] = useState(true);

  const scrollRef = useRef(null);

  // message
  const [message, setMessage] = useState("");
  const [messageWithEmoji, setMessageWithEmoji] = useState("");
  const [emojys, setEmojys] = useState([]);
  const messageInputRef = useRef(null);

  // last doc
  const [lastDoc, setLastDoc] = useState(null);
  const [isLastDocUpdated, setIsLastDocUpdated] = useState(false);
  const [isLastDocExist, setIsLastDocExist] = useState(false);
  const [images, setImages] = useState([]);

  // lastMessage played
  const [lastPlayedMessage, setLastPlayedMessage] = useState(null);

  // is Emoji Picker Show
  const [isEmojiPickerShow, setIsEmojiPickerShow] = useState(false);

  // set all messages
  const setAllMessages = useMessages((state) => state.setAllMessages);

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
  // set isAllUsersShow
  const setIsAllUsersShowe = useUsers((state) => state.setIsAllUsersShow);

  // allMessages
  const lastMessage = useMessages((state) => state.getLastMessage);

  // handel back
  const handelBack = () => {
    setIsAllUsersShowe(false);
    const curretnUserId = getCurrentUser().uid;
    const uniqueChatId = getUniqueChatId();
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      const document = doc.data();
      if (curretnUserId === document.sender) {
        updateDoc(chatRef, {
          sender: deleteField(),
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      } else {
        updateDoc(chatRef, {
          receiver: deleteField(),
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      }
    });
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

  const updateEmojiURL = (emojis, message) => {
    emojis.forEach((emoji) => {
      // check if the message include emoji
      if (message.includes(emoji.emoji)) {
        message = message.replace(
          emoji.emoji,
          emoji.emojiURL
        );
      }
    });
    return message;
  };

  // make a query to get all unread message from the selected user
  const getUnreadMessage = async () => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId = getUniqueChatId();

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
          }).catch((error) => {
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

  // update how is view this chat
  const updateChatView = (uniqueChatId) => {
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      const document = doc.data();
      if (document.sender && document.receiver) {
        getUnreadMessage();
      }
    });
  };

  // add message to database
  const addMessageTODataBase = async (
    message,
    uniqueChatId,
    selectedUserId,
    currentUserId,
    path
  ) => {
    try {
      const docRef = doc(db, "messages", uniqueChatId);
      getDoc(docRef)
        .then((querySnapshot) => {
          let isReceived = false;
          if (querySnapshot.data().sender && querySnapshot.data().receiver) {
            console.log("both connecte" . querySnapshot.data().sender, querySnapshot.data().receiver);
            isReceived = true;
          }
          const messageRef = collection(db, "messages", uniqueChatId, "chat");
          const messageData = {
            id: getUniqueId(),
            content: message,
            from: currentUserId,
            to: selectedUserId,
            createdAt: serverTimestamp(),
            isRead: false,
            isReceived: isReceived,
            media: path ? path : null,
          };
          addDoc(messageRef, messageData).then(() => fetchImagesInChat(uniqueChatId)).catch((e) => console.log(e.message));
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
          setDoc(
            doc(currentUserLastMessageRef, selectedUserId),
            messageData
          ).catch((e) => console.log(e.message));
          setDoc(
            doc(selectedUserLastMessageRef, currentUserId),
            messageData
          ).catch((e) => console.log(e.message));
        })
        .catch((e) => console.log(e.message));
      updateChatView(uniqueChatId);
      
    } catch (error) {
      console.log(error.message);
    }
  };

  // update the message in the local state
  const updateMessageLocaly = (message, uniqueChatId, file) => {
    const docRef = doc(db, "messages", uniqueChatId);
    let isReceived = false;
    getDoc(docRef).then((querySnapshot) => {
      if (querySnapshot.data().sender && querySnapshot.data().receiver) {
        isReceived = true;
      }
    });
    const messageData = {
      id: getUniqueId(),
      content: message,
      createdAt: new Date().getTime(),
      isRead: false,
      from: getCurrentUser().uid,
      to: getSelectedUser().uid,
      isReceived,
      media: file ? file : null,
    };
    setMessages((prev) => [...prev, messageData]);
    setAllMessages(messageData);

    setMessage("");
    setEmojys([]);
    setIsArabic(true);
    // scroll to the last message
    setTimeout(() => {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // get unique chat id
  const getUniqueChatId = () => {
    const selectedUserId = getSelectedUser().uid;
    const currentUserId = getCurrentUser().uid;
    if (currentUserId > selectedUserId) {
      return `${currentUserId + selectedUserId}`;
    } else {
      return `${selectedUserId + currentUserId}`;
    }
  };

  // help upload image to database
  const helpUploadImage = (path , newMessage) => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId = getUniqueChatId();
    addMessageTODataBase(
      newMessage,
      uniqueChatId,
      selectedUserId,
      currentUserId,
      path
    );
  };

  // update the photo img in firebase
  const uploadTheImageFile = (file , newMessage) => {
    // unique image name
    const imageName = new Date().getTime() + file.name;
    const storageRef = ref(
      storage,
      `photo/${getCurrentUser().uid}/${imageName}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error.message);
        // Handle unsuccessful uploads
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const fullPath = uploadTask.snapshot.ref.fullPath;
          helpUploadImage(downloadURL , newMessage);
        });
      }
    );
  };

  // handel send message
  const handelSendMessage = (e) => {
    e && e.preventDefault();
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId = getUniqueChatId();
    const newMessage =  updateEmojiURL(emojys , message);
    if (
      file ||
      (file !== null && message.length > 0 && message.trim().length > 0)
    ) {
      uploadTheImageFile(file , newMessage);
      
      updateMessageLocaly(newMessage, uniqueChatId, file);
      setFile(null);
      return;
    }
    if (message.length > 0 && message.trim().length > 0) {
      addMessageTODataBase(
        newMessage,
        uniqueChatId,
        selectedUserId,
        currentUserId
      );
      updateMessageLocaly(newMessage, uniqueChatId);
    }
  };

  // get last 20 messages
  useEffect(() => {
    setMessage("");
    setEmojys([]);
    setIsEmojiPickerShow(false);
    setIsArabic(true);
    const uniqueChatId = getUniqueChatId();
    fetchImagesInChat(uniqueChatId)
    setIsLastDocUpdated(false);
    // get the last 10 messages
    const messageRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(messageRef, orderBy("createdAt", "desc"), limit(20));
    setIsMessagesLoaded(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      // get the last doc
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setIsLastDocExist(true);
      setLastDoc(lastDoc);
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      const reversedMessages = messages.reverse();
      setMessages(reversedMessages);
      setAllMessages(reversedMessages, false);
      setIsMessagesLoaded(false);
    });
    return () => unsubscribe();
  }, [getSelectedUser().uid]);

  // scroll to bottom when new message send
  useEffect(() => {
    if (!isLastDocUpdated) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const lastMessages = lastMessage();
    if (
      lastMessages &&
      lastMessages.from !== getCurrentUser().uid &&
      lastMessages.isReceived === true &&
      lastMessages !== lastPlayedMessage
    ) {
      const sound = new Audio(ViewChatSound);
      sound.play();
      setLastPlayedMessage(lastMessages);
    }
  }, [messages.length, lastPlayedMessage]);

  // handel selected image
  const selectedImage = (img, content) => {
    if (img && content) {
      setImageAndContent({ img, content });
      setIsImageSelected(true);
    } else if (img) {
      setImageAndContent({ img });
      setIsImageSelected(true);
    } 
  };

  // handel file upload
  const handelFile = (e) => {
    const file = e.target.files[0];
    // Check if the file type is an image
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }

    setFile(file);
    setIsEmojiPickerShow(false);
  };

  // handel fetch more messages
  const handelFetchMoreMessages = () => {
    const uniqueChatId = getUniqueChatId();
    // check if the last doc is null
    if (!lastDoc) return;
    const messageRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(
      messageRef,
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );
    setIsMessagesLoaded(true);
    getDocs(q).then((querySnapshot) => {
      const messages = [];
      // get the last doc
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      if (!lastDoc) {
        setIsLastDocExist(false);
        setIsMessagesLoaded(false);
        return;
      }

      setLastDoc(lastDoc);
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      const reversedMessages = messages.reverse();
      if (reversedMessages.length === 0) {
        setIsMessagesLoaded(false);
        setIsLastDocExist(false);
        return;
      }
      setIsLastDocUpdated(true);
      setMessages((prevMessages) => [...reversedMessages, ...prevMessages]);
      setIsMessagesLoaded(false);
    });
  };

  // fetch all the images in the chat
  const fetchImagesInChat = (uniqueChatId) => {
    const messageRef = collection(db, "messages", uniqueChatId, "chat");
    const q = query(messageRef, where("media", "!=", null));
    getDocs(q).then(querySnapshot => {
        const images = [];
        querySnapshot.forEach((doc) => {
          images.push({ ...doc.data(), id: doc.id });
        });
        const srcImages = images.map((image) => {
          return {
            src: image.media,
            alt: image.content,
            time: image.createdAt?.seconds ? image.createdAt.seconds  : image.createdAt,
          };
        });
        // sort the images by time
        srcImages.sort((a, b) => a.time - b.time);
        setImages(srcImages);
    })
  }

  // replace emoji url with emoji image
  const replaceEmojiWithImage = (message) => {
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


  // handel input and Emoji picker
  const handelEmojiPicker = (emojiData) => {
    const emoji = emojiData.emoji;
    const emojiUnified = emojiData.unified ;
    const emojiURL = emojiData.getImageUrl()
    
    
    
    setEmojys((prevEmojys) => [...prevEmojys, { emoji, emojiUnified , emojiURL}]);
    setMessage((prevMessage) => {
      return `${prevMessage} ${emoji}`
    });
    // const currentEmojys = [...emojys , { emoji, emojiUnified , emojiURL}]
    // const currentMessage = `${message} ${emoji}`
    // const newMessage =  updateEmojiURL(currentEmojys , currentMessage);
    // const updatedMessage = replaceEmojiWithImage(newMessage);
    // setMessageWithEmoji(updatedMessage);
  };



  // handel input Message focus
  const handelInputFocus = () => {
    setIsEmojiPickerShow(false);
  };

  // handel show Emoji picker component
  const handelShowEmojiPicker = () => {
    setIsEmojiPickerShow((prev) => !prev);
    if (isEmojiPickerShow) {
      messageInputRef.current.focus();
    } else {
      messageInputRef.current.blur();
    }
  };

//  track the changes in the selected user
  useEffect(() => {
    const docRef = doc(db, 'users' , getSelectedUser()?.uid)
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setSelectedUser({...doc.data() , id: doc.id})
    })
    return () => unsubscribe()
  }, [getSelectedUser()?.uid])

  return (
    <div className={`chat-page--container ${!isSelectedUser ? "hide" : ""}`}>
      {file && (
        <Suspense fallback={<SpinerLoader />}>
          <ViewSelectedImage
            file={file}
            setFile={setFile}
            displayName={getSelectedUser()?.displayName}
            handelMessage={handelMessage}
            isArabic={isArabic}
            handelSendMessage={handelSendMessage}
            message={message}
            EmojyPiker={ <EmojiPicker
              onEmojiClick={handelEmojiPicker}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
              theme="auto"
              categories={[
                {
                  category: 'suggested',
                  name: 'المستخدمة مؤخراً'
                },
                {
                  category: 'smileys_people',
                  name: 'الوجوه والناس'
                },
               {
                category : 'animals_nature',
                name : 'الحيوانات والطبيعة'
                },
                {
                  category : 'food_drink',
                  name : 'الطعام والشراب'
                },
                {
                  category : 'travel_places',
                  name : 'السفر والأماكن'
                },
                {
                  category : 'activities',
                  name : 'الأنشطة'
                },
                {
                  category : 'objects',
                  name : 'الأشياء'
                },
                {
                  category : 'symbols',
                  name : 'الرموز'
                },
                {
                  category : 'flags',
                  name : 'الأعلام'
                },

              ]}
              searchDisabled={true}
            />}
          />
        </Suspense>
      )}

      {isImageSelected && (
        <ViewFullImage
          file={imageAndContent}
          setIsImageSelected={setIsImageSelected}
          images={images}
        />
      )}
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
            {/* see more messages */}
            {isLastDocExist && messages.length > 10 && (
              <div className="d-f">
                <button
                  className="seeMore f-ar dr-ar"
                  onClick={handelFetchMoreMessages}
                >
                  الرسائل الأقدم
                </button>
              </div>
            )}
            {/* display all the messages */}
            {messages.length > 0 &&
              messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  isSender={message.from}
                  createdAt={message.createdAt}
                  isRead={message.isRead}
                  media={message.media}
                  id={message.id}
                  onclike={() => selectedImage(message.media, message.content)}
                />
              ))}
            {isMessagesLoaded && <SpinerLoader />}
            <div ref={scrollRef}></div>
          </div>
        </div>
      </div>
      {/* footer */}
      <footer className={`${isEmojiPickerShow ? "show-emoji" : ""}`}>
        {isEmojiPickerShow && (
          <div className="emoji-picker">
            <EmojiPicker
              onEmojiClick={handelEmojiPicker}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
              theme="auto"
              categories={[
                {
                  category: 'suggested',
                  name: 'المستخدمة مؤخراً'
                },
                {
                  category: 'smileys_people',
                  name: 'الوجوه والناس'
                },
               {
                category : 'animals_nature',
                name : 'الحيوانات والطبيعة'
                },
                {
                  category : 'food_drink',
                  name : 'الطعام والشراب'
                },
                {
                  category : 'travel_places',
                  name : 'السفر والأماكن'
                },
                {
                  category : 'activities',
                  name : 'الأنشطة'
                },
                {
                  category : 'objects',
                  name : 'الأشياء'
                },
                {
                  category : 'symbols',
                  name : 'الرموز'
                },
                {
                  category : 'flags',
                  name : 'الأعلام'
                },

              ]}
              searchDisabled={true}
            />
          </div>
        )}
        <div className="forme d-f">
          <div className="icons">
            <div className="icon d-f" onClick={handelShowEmojiPicker}>
              {isEmojiPickerShow ? <FaKeyboard /> : <SmileFace />}
            </div>
            <label htmlFor="file-input" className={`icon d-f`}>
              <BsImageFill />
            </label>
            <input
              onChange={handelFile}
              id="file-input"
              type="file"
              name="file"
              style={{ display: "none" }}
            />
          </div>
          <form onSubmit={handelSendMessage}>
            <div className="input">
            {/* <div className={`overite-input ${isArabic ? "f-ar" : "f-en dr-en"}`}>
              {messageWithEmoji.map((content, index) => (
            <React.Fragment key={index}>{content} </React.Fragment>
          ))}
            </div> */}
              <input
                type="text"
                placeholder="اكتب رسالة"
                ref={messageInputRef}
                onFocus={handelInputFocus}
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
        </div>
      </footer>
    </div>
  );
}
