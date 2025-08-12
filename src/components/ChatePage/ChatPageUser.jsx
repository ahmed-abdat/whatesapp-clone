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
// import "../styles/chatPageUser.css"; // Removed - using Tailwind CSS only
import AudioPlayer from "./AudioPlayer";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../ui/scroll-area";

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
    const AmPm = `${lastSeenMoment.format("a") === "am" ? "ص" : "م"}`;
    if (lastSeenMoment.isSame(now, "day")) {
      return ` آخر ظهور اليوم عند الساعة ${HourAndMinitFormat} ${AmPm}`;
    } else if (lastSeenMoment.isSame(now.clone().subtract(1, "day"), "day")) {
      return `آخر ظهور أمس عند الساعة ${HourAndMinitFormat} ${AmPm}`;
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
  const [audioDuration, setAudioDuration] = useState(0);
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
    if (recordingTime > 0) setAudioDuration(recordingTime);
  }, [recordingTime]);

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
      // if the document content only one user delet the doc
      if (Object.keys(document).length === 1) {
        deleteDoc(chatRef).catch((error) => {
          console.error("Error removing document: ", error);
        });
      } else {
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
                  content: message,
                  fullPath,
                }
              : null,
          };
          if (file?.type?.includes("image"))
            fetchImagesInChat(currentUserId, selectedUserId);

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
      const { src } = media;
      setImageAndContent({ src, content });
      setIsImageSelected(true);
    } else if (media) {
      const { src } = media;
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
      "image/vnd.microsoft.icon",
    ];
    const q = query(
      messageRef,
      where("media.type", "in", imageFormats),
      limit(20)
    );
    getDocs(q).then((querySnapshot) => {
      const images = [];
      querySnapshot.forEach((doc) => {
        images.push({
          src: doc.data().media.src,
          alt: doc.data().content,
          time: doc.data().createdAt?.seonds
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
    setIsEmojiPickerShow(false);
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className={`flex flex-col h-full w-full ${
        !isSelectedUser ? "hidden" : ""
      }`}
    >
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
            images={images}
            isGalleryMode={images.length > 0}
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
      {/* Chat Header - Classic WhatsApp Style */}
      <header className="bg-whatsapp-bg border-l border-gray-300 h-14 sm:h-16 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-sm shrink-0">
        {/* Back Button */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            className="flex items-center rounded-full p-2 hover:bg-black/10 transition-colors"
            onClick={handelBack}
            aria-label="رجوع"
          >
            <BiArrowBack className="text-[20px] text-gray-600 rotate-180" />
          </button>

          {/* Avatar (fixed size) */}
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={getSelectedUser()?.photoURL || defaultAvatar}
              alt="avatar"
            />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>

          {/* User Info */}
          <button
            type="button"
            className="min-w-0 text-left"
            onClick={() => setIsSelectedUserProfileShow(true)}
          >
            <h3 className="text-sm font-medium text-gray-900 leading-tight m-0">
              {getSelectedUser()?.displayName || "ahmed"}
            </h3>
            <p className="font-arabic text-xs text-gray-600 leading-tight m-0">
              {getSelectedUser()?.isOnline ? "متصل الآن" : timeAgo}
            </p>
          </button>
        </div>

        {/* Header Icons and Menu (no position classes) */}
        {messages.length > 0 && (
          <div className="flex flex-col items-end gap-1" ref={headerIconsRef}>
            <button
              type="button"
              className={`p-2 flex items-center rounded-full text-gray-600 text-[20px] transition-colors ${
                isPopupShow ? "bg-black/10" : "hover:bg-black/10"
              }`}
              onClick={() => setIsPopupShow((prev) => !prev)}
              aria-label="المزيد"
            >
              <HiDotsVertical />
            </button>
            {isPopupShow && (
              <div
                className="bg-white rounded-md shadow-lg w-48 py-2 border border-gray-100"
                ref={popupContainerRef}
              >
                <ul className="list-none font-arabic">
                  <li
                    onClick={() => setIsSelectedUserProfileShow(true)}
                    className="cursor-pointer py-3 px-4 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                  >
                    مشاهدة جهة الإتصال
                  </li>
                  <li
                    onClick={handelShowModel}
                    className="cursor-pointer py-3 px-4 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                  >
                    مسح محتوى الدردشة
                  </li>
                </ul>
              </div>
            )}
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
      {/* Chat Messages Area - Fixed Height with Scrolling */}
      <div className="flex-1 min-h-0 relative">
        {/* WhatsApp Chat Background Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-6"
          style={{
            backgroundImage: `url(${ChatImg})`,
            backgroundSize: "412px 749px",
            backgroundRepeat: "repeat",
            backgroundColor: "#efeae2"
          }}
        ></div>

        {/* Messages Container with Fixed Height and Scrolling */}
        <ScrollArea className="relative z-10 h-full w-full">
          <div className="px-3 sm:px-6 lg:px-8 py-4 flex flex-col gap-0.5 min-h-full">
            {/* Load More Messages Button */}
            {isLastDocExist && messages.length >= 20 && (
              <div className="flex justify-center mb-4">
                <button
                  className="bg-white shadow-sm hover:shadow-md transition-all px-4 py-2 text-sm font-arabic text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50"
                  onClick={handelFetchMoreMessages}
                >
                  الرسائل الأقدم
                </button>
              </div>
            )}
            {/* Display all messages */}
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
        </ScrollArea>
      </div>
      {/* Footer - Message Input Area - WhatsApp Style */}
      <footer
        className={cn(
          "bg-whatsapp-bg border-t border-gray-300 px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-3 transition-all duration-300 shadow-sm shrink-0",
          isEmojiPickerShow ? "h-[520px]" : "h-auto"
        )}
      >
        {/* Emoji Picker */}
        {isEmojiPickerShow && (
          <div className="emoji-picker w-full order-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <EmojiPicker
              onEmojiClick={handelEmojiPicker}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
              theme="auto"
              categories={[
                { category: "suggested", name: "المستخدمة مؤخراً" },
                { category: "smileys_people", name: "الوجوه والناس" },
                { category: "animals_nature", name: "الحيوانات والطبيعة" },
                { category: "food_drink", name: "الطعام والشراب" },
                { category: "travel_places", name: "السفر والأماكن" },
                { category: "activities", name: "الأنشطة" },
                { category: "objects", name: "الأشياء" },
                { category: "symbols", name: "الرموز" },
                { category: "flags", name: "الأعلام" },
              ]}
              searchDisabled={true}
            />
          </div>
        )}
        {/* Audio Recording Interface */}
        {isAudioRecording ? (
          <div className="audio-recording bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              {/* Audio Preview */}
              {audioDetails && (
                <div className="flex-1">
                  <AudioPlayer
                    audioSrc={audioDetails}
                    duratione={audioDuration}
                  />
                </div>
              )}
              {/* Recording Time */}
              {isRecording && !audioDetails && (
                <p className="text-lg font-mono text-red-500 flex-1 text-center">
                  {formatTimeAudioRecording(recordingTime)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Send Button */}
              <button
                disabled={isRecording}
                onClick={handelSendAudio}
                className={cn(
                  "bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isRecording ? "opacity-40 cursor-not-allowed" : ""
                )}
              >
                <Send className="w-5 h-5" />
              </button>

              {/* Pause/Resume Button */}
              {isRecording && (
                <button
                  onClick={() => togglePauseResume()}
                  className="text-gray-600 hover:text-gray-800 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  {isPaused ? (
                    <ImPlay2 className="w-6 h-6" />
                  ) : (
                    <Pause className="w-6 h-6" />
                  )}
                </button>
              )}

              {/* Stop/Record Button */}
              {isRecording ? (
                <button
                  onClick={() => stopRecording()}
                  className="text-red-500 hover:text-red-600 w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <HiStop className="w-7 h-7" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAudioDetails(null);
                    startRecording();
                  }}
                  className="text-gray-600 hover:text-gray-800 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <Voice className="w-6 h-6" />
                </button>
              )}

              {/* Cancel Button */}
              <button
                onClick={handelStopRecording}
                className="text-gray-600 hover:text-red-500 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Message Input Form - WhatsApp Style */
          <div className="w-full">
            <form onSubmit={handelSendMessage} className="flex items-end gap-2">
              {/* Left Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handelShowEmojiPicker}
                  className="p-2 sm:p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors touch-manipulation"
                >
                  {isEmojiPickerShow ? (
                    <FaKeyboard className="w-5 h-5" />
                  ) : (
                    <SmileFace className="w-5 h-5" />
                  )}
                </button>
                <label
                  htmlFor="file-input"
                  className="p-2 sm:p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation"
                >
                  <BsImageFill className="w-5 h-5" />
                </label>
                <input
                  onChange={handelFile}
                  id="file-input"
                  type="file"
                  name="file"
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Message Input */}
              <div className="flex-1">
                <input
                  placeholder="اكتب رسالة"
                  ref={messageInputRef}
                  onFocus={handelInputFocus}
                  onChange={handelMessage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handelSendMessage();
                    }
                  }}
                  value={message}
                  className={cn(
                    "w-full px-3 sm:px-4 py-2.5 bg-white border border-gray-200 rounded-3xl text-[15px] text-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-300 transition-all resize-none",
                    isArabic ? "font-arabic text-right" : "text-left"
                  )}
                />
              </div>

              {/* Right Icon - Send or Voice */}
              <div className="flex items-center">
                {message.length > 0 ? (
                  <button
                    type="submit"
                    className="p-2.5 bg-whatsapp-primary hover:bg-whatsapp-primary-dark text-white rounded-full transition-colors shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handelStartRecording}
                    className="p-2 sm:p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors touch-manipulation"
                  >
                    <Voice className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </footer>
    </div>
  );
}
