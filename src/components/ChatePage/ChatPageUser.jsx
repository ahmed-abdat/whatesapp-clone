import moment from "moment";
import React from "react";
import useSelectedUser from "../../store/useSelectedUser";
import { HiDotsVertical, HiSearch, HiStop } from "react-icons/hi";
import { FaKeyboard, FaTrash } from "react-icons/fa";
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
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { MdDeleteForever } from "react-icons/md";
import SpinerLoader from "../SpinerLoader";
import useUser from "../../store/useUser";
import useUsers from "../../store/useUsers";
import ViewChatSound from "../../assets/sounds/viewMessage.mp3";
import ViewFullImage from "./ViewFullImage";
import { BsImageFill } from "react-icons/bs";
import { lazy, Suspense } from "react";
import useMessages from "../../store/useMessages";
import EmojiPicker from "emoji-picker-react";
import DeleteModule from "../DeleteModule";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { ImPlay2 } from "react-icons/im";
import Pause from "../svg/Pause";
import "../styles/chatPageUser.css";
import AudioPlayer from "./AudioPlayer";

// lazy loade
const ViewSelectedImage = lazy(() => import("../ViewSelectedImage"));
const SelectedUserProfile = lazy(() => import("../SelectedUserProfile"));

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
  const lastSeen = getSelectedUser()?.lastSeen?.seconds
    ? getSelectedUser()?.lastSeen?.seconds * 1000
    : getSelectedUser()?.lastSeen;
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
  const chatRef = useRef(null)

  // message
  const [message, setMessage] = useState("");
  const [emojys, setEmojys] = useState([]);
  const messageInputRef = useRef(null);

  const [isPopupShow, setIsPopupShow] = useState(false);
  const [isModuleshow, setIsModuleShow] = useState(false);
  const headerIconsRef = useRef(null);
  const popupContainerRef = useRef(null);

  // selected user profile show
  const [isSelectedUserProfileShow, setIsSelectedUserProfileShow] =
    useState(false);

  // last doc
  const [lastDoc, setLastDoc] = useState(null);
  const [isLastDocUpdated, setIsLastDocUpdated] = useState(false);
  const [isLastDocExist, setIsLastDocExist] = useState(false);
  const [images, setImages] = useState([]);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioDetails, setAudioDetails] = useState(null);
  const [audioDuration , setAudioDuration] = useState(0)
  const {
    startRecording,
    stopRecording,
    recordingTime,
    recordingBlob,
    isRecording,
    isPaused,
    togglePauseResume,
  } = useAudioRecorder();

  // get the audio blob URL and set it to the audio tag
  useEffect(() => {
    if (!recordingBlob) return;
    const audioURL = URL.createObjectURL(recordingBlob);
    setAudioDetails(audioURL);
  }, [recordingBlob]);
  

  useEffect(() => {
    if(recordingTime > 0) setAudioDuration(recordingTime)
  }, [recordingTime])

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

  // last message
  const lastMessage = useMessages((state) => state.getlastMessage);
  // is both user connected
  const [isBothUserConnected, setIsBothUserConnected] = useState(false);

  // get unique chat id
  const uniqueChatid = (currentUserId, selectedUserId) => {
    if (currentUserId > selectedUserId) {
      return currentUserId + selectedUserId;
    } else {
      return selectedUserId + currentUserId;
    }
  };

  // handel back
  const handelBack = () => {
    setIsAllUsersShowe(false);
    setAudioDetails(null);
    stopRecording();
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId = uniqueChatid(curretnUserId, selectedUserId);
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

  const updateEmojiURL = (emojis, message) => {
    emojis.forEach((emoji) => {
      // check if the message include emoji
      if (message.includes(emoji.emoji)) {
        message = message.replace(emoji.emoji, emoji.emojiURL);
      }
    });
    return message;
  };

  // make a query to get all unread message from the selected user
  const getUnreadMessage = async () => {
    const curretnUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const collectionRef = collection(
      db,
      "users",
      curretnUserId,
      "messages",
      selectedUserId,
      "chat"
    );
    const q = query(
      collectionRef,
      where("isRead", "==", false)
      // where("from", "==", curretnUserId)
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
  const updateChatView = (currentUserId, selectedUserId) => {
    const uniqueChatId = uniqueChatid(currentUserId, selectedUserId);
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      const document = doc.data();
      if (document.sender && document.receiver) {
        setIsBothUserConnected(true);
        getUnreadMessage();
      } else {
        setIsBothUserConnected(false);
      }
    });
  };

  // add message to database
  const addMessageTODataBase = async (
    message,
    currentUserId,
    selectedUserId,
    path,
    fullPath,
    file
  ) => {
    try {
      const uniqueChatId = uniqueChatid(currentUserId, selectedUserId);
      const currentUserColl = collection(db, "messages");
      const currentUserDoc = doc(currentUserColl, uniqueChatId);
      getDoc(currentUserDoc)
        .then((querySnapshot) => {
          let isReceived = false;
          let isRead = false;
          if (querySnapshot.data()?.sender && querySnapshot.data()?.receiver) {
            isReceived = true;
            isRead = true;
          }
          const currentUserCollChat = collection(
            db,
            "users",
            currentUserId,
            "messages",
            selectedUserId,
            "chat"
          );

          const messageData = {
            id: selectedUserId,
            content: message,
            from: currentUserId,
            to: selectedUserId,
            createdAt: serverTimestamp(),
            isRead,
            isReceived,
            media: path
              ? {
                  type: file?.type ? file.type : null,
                  src: path,
                  content : message,
                  fullPath,
                }
              : null,
          };
          if (file?.type?.includes('image'))  fetchImagesInChat(currentUserId, selectedUserId);
      
          addDoc(currentUserCollChat, messageData)
            .then((docRef) => {
              const id = docRef.id;
              const selectedUserDoc = doc(
                db,
                "users",
                selectedUserId,
                "messages",
                currentUserId,
                "chat",
                id
              );
              getDoc(selectedUserDoc)
                .then((doc) => {
                  setDoc(selectedUserDoc, messageData).catch((e) =>
                    console.error(e.message)
                  );
                })
                .catch((e) => console.error(e.message));
            })
            .catch((e) => console.error(e));

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
        .catch((e) => console.error(e.message));
      updateChatView(currentUserId, selectedUserId);
    } catch (error) {
      console.error(error.message);
    }
  };

  // update the message in the local state
  const updateMessageLocaly = (
    message,
    currentUserId,
    selectedUserId,
    file
  ) => {
    const messageData = {
      id: selectedUserId,
      content: message,
      createdAt: new Date().getTime(),
      isRead: false,
      from: currentUserId,
      to: selectedUserId,
      isReceived: false,
      media: file ? file : null,
    };
    setMessages((prev) => [...prev, messageData]);
    setAllMessages(messageData);

    setMessage("");
    setEmojys([]);
    setIsArabic(true);
    // scroll to the last message
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // help upload image to database
  const helpUploadImage = (path, newMessage, fullPath) => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    addMessageTODataBase(
      newMessage,
      currentUserId,
      selectedUserId,
      path,
      fullPath,
      file
    );
  };

  // update the photo img in firebase
  const uploadTheImageFile = (file, newMessage) => {
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
          console.log("File available at", fullPath);
          helpUploadImage(downloadURL, newMessage, fullPath);
        });
      }
    );
  };

  // handel send message
  const handelSendMessage = (e) => {
    e && e.preventDefault();
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const newMessage = updateEmojiURL(emojys, message);
    if (
      file ||
      (file !== null && message.length > 0 && message.trim().length > 0)
    ) {
      uploadTheImageFile(file, newMessage);

      updateMessageLocaly(newMessage, currentUserId, selectedUserId, file);
      setFile(null);
      return;
    }
    if (message.length > 0 && message.trim().length > 0) {
      addMessageTODataBase(newMessage, currentUserId, selectedUserId);
      updateMessageLocaly(newMessage, currentUserId, selectedUserId);
    }
  };

  // get last 20 messages
  useEffect(() => {
    setMessage("");
    setEmojys([]);
    setIsEmojiPickerShow(false);
    setIsArabic(true);
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    let unsubscribe;
    if (selectedUserId) {
      fetchImagesInChat(currentUserId, selectedUserId);
      setIsLastDocUpdated(false);
      // get the last 10 messages
      const messageRef = collection(
        db,
        "users",
        currentUserId,
        "messages",
        selectedUserId,
        "chat"
      );
      const q = query(messageRef, orderBy("createdAt", "desc"), limit(20));
      setIsMessagesLoaded(true);
      unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    } else {
      setIsSelectedUser(false);
      setSelectedUser(null);
    }
    return () => unsubscribe?.();
  }, [getSelectedUser()?.uid]);

  // scroll to bottom when new message send
  useEffect(() => {
    if (!isLastDocUpdated) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  

    const lasteMessage = lastMessage();
    if (
      lasteMessage?.from !== getCurrentUser().uid &&
      isBothUserConnected === true
    ) {
      const sound = new Audio(ViewChatSound);
      sound.play();
      const currentUserId = getCurrentUser()?.uid;
      const selectedUserId = getSelectedUser()?.uid;
      if (currentUserId && selectedUserId && lasteMessage?.media !== null) {
        fetchImagesInChat(currentUserId, selectedUserId);
      }
      console.log("sound");
    }
  }, [lastMessage()?.content, isLastDocUpdated, messages.length]);

  // get unique chat id
  const getUniqueChatId = (currentUserId, selectedUserId) => {
    if (currentUserId > selectedUserId) {
      return currentUserId + selectedUserId;
    } else {
      return selectedUserId + currentUserId;
    }
  };

  // is both user connected
  useEffect(() => {
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    const uniqueChatId = getUniqueChatId(currentUserId, selectedUserId);
    const howIsViewingRef = doc(db, "messages", uniqueChatId);
    const unsubscribe = onSnapshot(howIsViewingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data?.sender && data?.receiver) {
          setIsBothUserConnected(true);
        } else {
          setIsBothUserConnected(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // handel selected image
  const selectedImage = (media, content) => {
    if (media && content) {
      const {src} = media
      setImageAndContent({ src, content });
      setIsImageSelected(true);
    } else if (media) {
      const {src} = media
      setImageAndContent({ src });
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
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    // check if the last doc is null
    if (!lastDoc) return;
    const messageRef = collection(
      db,
      "users",
      currentUserId,
      "messages",
      selectedUserId,
      "chat"
    );
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
  const fetchImagesInChat = (currentUserId, selectedUserId) => {
    const messageRef = collection(
      db,
      "users",
      currentUserId,
      "messages",
      selectedUserId,
      "chat"
    );
     const imageFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/webp",
      "image/svg+xml",
      "image/heic",
      "image/raw",
      "image/vnd.microsoft.icon"
    ];
    const q = query(messageRef, where("media.type", 'in', imageFormats) , limit(20));
    getDocs(q).then((querySnapshot) => {
      const images = [];
      querySnapshot.forEach((doc) => {
        images.push({
          src: doc.data().media.src,
          alt: doc.data().media.content,
          time: doc.data().createdAt?.seconds
            ? doc.data().createdAt.seconds
            : doc.data().createdAt,
        });
      });
      images.sort((a, b) => a.time - b.time);
      setImages(images);
    });
  };

  // handel input and Emoji picker
  const handelEmojiPicker = (emojiData) => {
    const emoji = emojiData.emoji;
    const emojiUnified = emojiData.unified;
    const emojiURL = emojiData.getImageUrl();
    setEmojys((prevEmojys) => [
      ...prevEmojys,
      { emoji, emojiUnified, emojiURL },
    ]);
    setMessage((prevMessage) => {
      return `${prevMessage} ${emoji}`;
    });
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
    let unsubscribe = null;
    if (getSelectedUser()?.uid) {
      const docRef = doc(db, "users", getSelectedUser()?.uid);
      unsubscribe = onSnapshot(docRef, (doc) => {
        setSelectedUser({ ...doc.data(), id: doc.id });
      });
    } else {
      setIsSelectedUser(false);
      setSelectedUser(null);
    }
    return () => unsubscribe?.();
  }, [getSelectedUser()?.uid]);

  // handle outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        headerIconsRef.current &&
        (headerIconsRef?.current?.contains(e.target) ||
          popupContainerRef?.current?.contains(e.target))
      ) {
        return;
      }
      setIsPopupShow(false);
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // handel show module
  const handelShowModel = () => {
    setIsModuleShow(true);
    setIsPopupShow(false);
  };
  // handel close module
  const handelCloseModule = () => {
    setIsModuleShow(false);
  };

  // handel delete chat messages
  const handelDeleteChatMessages = async () => {
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    try {
      const chatRef = collection(
        db,
        "users",
        currentUserId,
        "messages",
        selectedUserId,
        "chat"
      );
      const q = query(chatRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref)
          .then(() => console.log("succefull delete"))
          .catch((e) => console.log(e.message));
        // delete the last Message doc
        delteLastMessageDoc(currentUserId, selectedUserId);
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // delte the last message doc
  const delteLastMessageDoc = async (currentUserId, selectedUserId) => {
    const lastMessageRef = doc(
      db,
      "users",
      currentUserId,
      "lastMessage",
      selectedUserId
    );
    getDoc(lastMessageRef)
      .then((doc) => {
        deleteDoc(doc.ref)
          .then(() => console.log("last message delete"))
          .catch((e) => console.log(e.message));
      })
      .catch((e) => console.log(e.message));
    setIsModuleShow(false);
    setIsSelectedUser(false);
    setSelectedUser(null);
  };

  // format the audio time recording
  const formatTimeAudioRecording = (sec) => {
    const minut = Math.floor(sec / 60);
    const second = Math.floor(sec % 60);
    const secondValue = second < 10 ? `0${second}` : second;
    return `${minut}:${secondValue}`;
  };

  // handel start recording
  const handelStartRecording = () => {
    setIsEmojiPickerShow(false)
    setIsAudioRecording(true);
    startRecording();
    setAudioDetails(null);
  };

  // handel stop recording
  const handelStopRecording = () => {
    setAudioDetails(null);
    stopRecording();
    setIsAudioRecording(false);
  };

  // handel send Audio Voice
  const handelSendAudio = () => {
    setAudioDetails(null);
    stopRecording();
    setIsAudioRecording(false);
    const blobName = recordingBlob?.type
      ? recordingBlob.type.slice(0, 5)
      : "audio-voice";
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    if (recordingBlob) {
      updateMessageLocaly("", currentUserId, selectedUserId, recordingBlob);
      uploadAudio(recordingBlob, blobName);
    }
  };

  // upload voice Audio
  const uploadAudio = (blob, blobName) => {
    // unique image name
    const audioname = new Date().getTime() + blobName;
    const storageRef = ref(
      storage,
      `audio/${getCurrentUser().uid}/${audioname}`
    );
    const uploadTask = uploadBytesResumable(storageRef, blob);
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
          const currentUserId = getCurrentUser().uid;
          const selectedUserId = getSelectedUser().uid;
          addMessageTODataBase(
            "",
            currentUserId,
            selectedUserId,
            downloadURL,
            fullPath,
            blob
          );
        });
      }
    );
  };


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);


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
            EmojyPiker={
              <EmojiPicker
                onEmojiClick={handelEmojiPicker}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                theme="auto"
                categories={[
                  {
                    category: "suggested",
                    name: "المستخدمة مؤخراً",
                  },
                  {
                    category: "smileys_people",
                    name: "الوجوه والناس",
                  },
                  {
                    category: "animals_nature",
                    name: "الحيوانات والطبيعة",
                  },
                  {
                    category: "food_drink",
                    name: "الطعام والشراب",
                  },
                  {
                    category: "travel_places",
                    name: "السفر والأماكن",
                  },
                  {
                    category: "activities",
                    name: "الأنشطة",
                  },
                  {
                    category: "objects",
                    name: "الأشياء",
                  },
                  {
                    category: "symbols",
                    name: "الرموز",
                  },
                  {
                    category: "flags",
                    name: "الأعلام",
                  },
                ]}
                searchDisabled={true}
              />
            }
          />
        </Suspense>
      )}

      {isImageSelected && (
        <ViewFullImage
          selectedImage={imageAndContent}
          setIsImageSelected={setIsImageSelected}
          images={images}
        />
      )}

      {isSelectedUserProfileShow && (
        <Suspense fallback={<SpinerLoader />}>
          <SelectedUserProfile
            setisProfileShow={setIsSelectedUserProfileShow}
            images={images}
          />
        </Suspense>
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
        <div
          className="info"
          onClick={() => setIsSelectedUserProfileShow(true)}
        >
          <h3>{getSelectedUser()?.displayName || "ahmed"}</h3>
          <p className="f-ar dr">
            {getSelectedUser()?.isOnline ? "متصل الآن" : timeAgo}
          </p>
        </div>
        {messages.length > 0 && (
          <div className="icons" ref={headerIconsRef}>
            {/* <div className="icon">
              <HiSearch />
            </div> */}
            <div
              className={`icon ${isPopupShow ? "bg--hover" : ""}`}
              onClick={() => setIsPopupShow((prev) => !prev)}
            >
              <HiDotsVertical />
            </div>
          </div>
        )}
        {isPopupShow && (
          <div className="popup--container" ref={popupContainerRef}>
            <ul className="popup--item f-ar">
              <li onClick={() => setIsSelectedUserProfileShow(true)}>
                مشاهدة جهة الإتصال
              </li>
              <li onClick={handelShowModel}> مسح محتوى الدردشة </li>
            </ul>
          </div>
        )}
        {isModuleshow && (
          <DeleteModule
            handelCancel={handelCloseModule}
            handelDelete={handelDeleteChatMessages}
            moduleTitle="delete chat"
            icon={<MdDeleteForever />}
          />
        )}
      </header>
      {/* chat container */}
      <div className="chat-content">
        <div
          className="bgi"
          style={{ backgroundImage: `url(${ChatImg})` }}
        ></div>
        <div className="message--container" ref={chatRef}>
          <div className="container" >
            {/* see more messages */}
            {isLastDocExist && messages.length >= 20 && (
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
                  category: "suggested",
                  name: "المستخدمة مؤخراً",
                },
                {
                  category: "smileys_people",
                  name: "الوجوه والناس",
                },
                {
                  category: "animals_nature",
                  name: "الحيوانات والطبيعة",
                },
                {
                  category: "food_drink",
                  name: "الطعام والشراب",
                },
                {
                  category: "travel_places",
                  name: "السفر والأماكن",
                },
                {
                  category: "activities",
                  name: "الأنشطة",
                },
                {
                  category: "objects",
                  name: "الأشياء",
                },
                {
                  category: "symbols",
                  name: "الرموز",
                },
                {
                  category: "flags",
                  name: "الأعلام",
                },
              ]}
              searchDisabled={true}
            />
          </div>
        )}
        {isAudioRecording ? (
          <div className="audio-recording">
            <div className="first-row">
              {/* audio */}
              {audioDetails && <AudioPlayer audioSrc={audioDetails} duratione={audioDuration}/>}
            {/* timing */}
            {
              isRecording && <p className="record-time f-en">
              {formatTimeAudioRecording(recordingTime)}
            </p>
            }
            </div>
         <div className="second-row">
             {/* send */}
             <button
              className={`send ${isRecording ? "disabeled" : ""}`}
              onClick={handelSendAudio}
            >
              <Send wh={18} />
            </button>
            {/* pause and resume */}
            {isRecording && (
              <button
                className="pause-resume"
                onClick={() => togglePauseResume()}
              >
                {isPaused ? <ImPlay2 /> : <Pause wh={30} />}
              </button>
            )}
            {/* stop and recorde */}
            {isRecording ? (
              <button className="stop" onClick={() => stopRecording()}>
                <HiStop />
              </button>
            ) : (
              <button
                className="record"
                onClick={() => {
                  setAudioDetails(null);
                  startRecording();
                }}
              >
                <Voice wh={30} />
              </button>
            )}
           
            <button className="trash" onClick={handelStopRecording}>
              <FaTrash />
            </button>
         </div>
          </div>
        ) : (
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
                <div className="icon" onClick={handelStartRecording}>
                  <Voice />
                </div>
              )}
            </form>
          </div>
        )}
      </footer>
    </div>
  );
}
