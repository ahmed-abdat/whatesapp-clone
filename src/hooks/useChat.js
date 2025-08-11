import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDocs, where, getDoc, updateDoc, deleteDoc, serverTimestamp, limit, startAfter, deleteField } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import useUser from "../store/useUser";
import useSelectedUser from "../store/useSelectedUser";
import useMessages from "../store/useMessages";
import moment from "moment";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLastDocExist, setIsLastDocExist] = useState(false);
  const [isBothUserConnected, setIsBothUserConnected] = useState(false);
  const [images, setImages] = useState([]);
  const [timeAgo, setTimeAgo] = useState('');
  const [isArabic, setIsArabic] = useState(true);
  const [file, setFile] = useState(null);
  const [emojys, setEmojys] = useState([]);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [isEmojiPickerShow, setIsEmojiPickerShow] = useState(false);

  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);
  const setAllMessages = useMessages((state) => state.setAllMessages);
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);

  const scrollRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    loadInitialMessages();
    return () => {
      // Cleanup function if needed
    };
  }, [getSelectedUser()?.uid]);

  useEffect(() => {
    updateLastSeen();
  }, [getSelectedUser()?.lastSeen]);

  useEffect(() => {
    checkBothUsersConnected();
  }, []);

  const loadInitialMessages = () => {
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    if (selectedUserId) {
      fetchImagesInChat(currentUserId, selectedUserId);
      const messageRef = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");
      const q = query(messageRef, orderBy("createdAt", "desc"), limit(20));
      setIsMessagesLoaded(true);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages = [];
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setIsLastDocExist(true);
        setLastDoc(lastDoc);
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ ...doc.data(), id: doc.id });
        });
        const reversedMessages = fetchedMessages.reverse();
        setMessages(reversedMessages);
        setAllMessages(reversedMessages, false);
        setIsMessagesLoaded(false);
        setInitialMessagesLoaded(true);
      });
      return unsubscribe;
    }
  };

  const sendMessage = async (message, file) => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const newMessage = updateEmojiURL(emojys, message);
    if (file || (file !== null && message.length > 0 && message.trim().length > 0)) {
      await uploadAndSendFile(file, newMessage, currentUserId, selectedUserId);
    } else if (message.length > 0 && message.trim().length > 0) {
      await addMessageToDatabase(newMessage, currentUserId, selectedUserId);
    }
    updateMessageLocally(newMessage, currentUserId, selectedUserId, file);
    setFile(null);
  };

  const uploadAndSendFile = async (file, message, currentUserId, selectedUserId) => {
    const imageName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `photo/${currentUserId}/${imageName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => {
        // Handle progress
      },
      (error) => {
        console.error(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const fullPath = uploadTask.snapshot.ref.fullPath;
          addMessageToDatabase(message, currentUserId, selectedUserId, downloadURL, fullPath, file);
        });
      }
    );
  };

  const addMessageToDatabase = async (message, currentUserId, selectedUserId, path, fullPath, file) => {
    try {
      const uniqueChatId = getUniqueChatId(currentUserId, selectedUserId);
      const currentUserColl = collection(db, "messages");
      const currentUserDoc = doc(currentUserColl, uniqueChatId);
      const docSnapshot = await getDoc(currentUserDoc);
      let isReceived = false;
      let isRead = false;
      if (docSnapshot.exists() && docSnapshot.data()?.sender && docSnapshot.data()?.receiver) {
        isReceived = true;
        isRead = true;
      }
      const currentUserCollChat = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");

      const messageData = {
        id: selectedUserId,
        content: message,
        from: currentUserId,
        to: selectedUserId,
        createdAt: serverTimestamp(),
        isRead,
        isReceived,
        media: path ? {
          type: file?.type ? file.type : null,
          src: path,
          content: message,
          fullPath,
        } : null,
      };

      if (file?.type?.includes('image')) fetchImagesInChat(currentUserId, selectedUserId);

      const docRef = await addDoc(currentUserCollChat, messageData);
      const selectedUserDoc = doc(db, "users", selectedUserId, "messages", currentUserId, "chat", docRef.id);
      await setDoc(selectedUserDoc, messageData);

      // Update last message in both users' lastMessage collection
      const currentUserLastMessageRef = doc(db, "users", currentUserId, "lastMessage", selectedUserId);
      const selectedUserLastMessageRef = doc(db, "users", selectedUserId, "lastMessage", currentUserId);
      await setDoc(currentUserLastMessageRef, messageData);
      await setDoc(selectedUserLastMessageRef, messageData);

      updateChatView(currentUserId, selectedUserId);
    } catch (error) {
      console.error(error.message);
    }
  };

  const updateMessageLocally = (message, currentUserId, selectedUserId, file) => {
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
    setEmojys([]);
    setIsArabic(true);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const fetchMoreMessages = () => {
    if (!lastDoc) return;
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    const messageRef = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");
    const q = query(messageRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(10));
    setIsMessagesLoaded(true);
    getDocs(q).then((querySnapshot) => {
      const fetchedMessages = [];
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      if (!lastDoc) {
        setIsLastDocExist(false);
        setIsMessagesLoaded(false);
        return;
      }
      setLastDoc(lastDoc);
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      const reversedMessages = fetchedMessages.reverse();
      if (reversedMessages.length === 0) {
        setIsMessagesLoaded(false);
        setIsLastDocExist(false);
        return;
      }
      setMessages((prevMessages) => [...reversedMessages, ...prevMessages]);
      setIsMessagesLoaded(false);
    });
  };

  const deleteChat = async () => {
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    try {
      const chatRef = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");
      const q = query(chatRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });
      await deleteLastMessageDoc(currentUserId, selectedUserId);
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteLastMessageDoc = async (currentUserId, selectedUserId) => {
    const lastMessageRef = doc(db, "users", currentUserId, "lastMessage", selectedUserId);
    try {
      const docSnapshot = await getDoc(lastMessageRef);
      if (docSnapshot.exists()) {
        await deleteDoc(docSnapshot.ref);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchImagesInChat = (currentUserId, selectedUserId) => {
    const messageRef = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");
    const imageFormats = [
      "image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff",
      "image/webp", "image/svg+xml", "image/heic", "image/raw", "image/vnd.microsoft.icon"
    ];
    const q = query(messageRef, where("media.type", 'in', imageFormats), limit(20));
    getDocs(q).then((querySnapshot) => {
      const fetchedImages = [];
      querySnapshot.forEach((doc) => {
        fetchedImages.push({
          src: doc.data().media.src,
          alt: doc.data().content,
          time: doc.data().createdAt?.seconds ? doc.data().createdAt.seconds : doc.data().createdAt,
        });
      });
      fetchedImages.sort((a, b) => a.time - b.time);
      setImages(fetchedImages);
    });
  };

  const updateLastSeen = () => {
    const now = moment();
    const lastSeen = getSelectedUser()?.lastSeen?.seconds
      ? getSelectedUser()?.lastSeen?.seconds * 1000
      : getSelectedUser()?.lastSeen;
    const lastSeenMoment = moment(lastSeen);
    const HourAndMinitFormat = lastSeenMoment.format("hh:mm");
    const dateFormat = lastSeenMoment.format("DD/MM/YYYY");
    const AmPm = `${lastSeenMoment.format("a") === "am" ? "ص" : "م"}`;

    if (lastSeenMoment.isSame(now, "day")) {
      setTimeAgo(`آخر ظهور اليوم عند الساعة ${HourAndMinitFormat} ${AmPm}`);
    } else if (lastSeenMoment.isSame(now.clone().subtract(1, "day"), "day")) {
      setTimeAgo(`آخر ظهور أمس عند الساعة ${HourAndMinitFormat} ${AmPm}`);
    } else {
      setTimeAgo(`آخر ظهور بتاريخ ${dateFormat}`);
    }
  };

  const checkBothUsersConnected = () => {
    const currentUserId = getCurrentUser()?.uid;
    const selectedUserId = getSelectedUser()?.uid;
    const uniqueChatId = getUniqueChatId(currentUserId, selectedUserId);
    const chatRef = doc(db, "messages", uniqueChatId);
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsBothUserConnected(!!(data?.sender && data?.receiver));
      }
    });
    return unsubscribe;
  };

  const getUniqueChatId = (currentUserId, selectedUserId) => {
    return currentUserId > selectedUserId
      ? currentUserId + selectedUserId
      : selectedUserId + currentUserId;
  };

  const updateChatView = (currentUserId, selectedUserId) => {
    const uniqueChatId = getUniqueChatId(currentUserId, selectedUserId);
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      const document = doc.data();
      if (document?.sender && document?.receiver) {
        setIsBothUserConnected(true);
        getUnreadMessages();
      } else {
        setIsBothUserConnected(false);
      }
    });
  };

  const getUnreadMessages = async () => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const collectionRef = collection(db, "users", currentUserId, "messages", selectedUserId, "chat");
    const q = query(collectionRef, where("isRead", "==", false));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, { isRead: true }).catch((error) => {
        console.error("Error updating document: ", error);
      });
    });

    // Update last message read in both users' lastMessage collection
    const currentUserLastMessageRef = doc(db, "users", currentUserId, "lastMessage", selectedUserId);
    const selectedUserLastMessageRef = doc(db, "users", selectedUserId, "lastMessage", currentUserId);
    await updateDoc(currentUserLastMessageRef, { isRead: true });
    await updateDoc(selectedUserLastMessageRef, { isRead: true });
  };

  const updateEmojiURL = (emojis, message) => {
    emojis.forEach((emoji) => {
      if (message.includes(emoji.emoji)) {
        message = message.replace(emoji.emoji, emoji.emojiURL);
      }
    });
    return message;
  };

  const handleEmojiPicker = (emojiData) => {
    const emoji = emojiData.emoji;
    const emojiUnified = emojiData.unified;
    const emojiURL = emojiData.getImageUrl();
    setEmojys((prevEmojys) => [...prevEmojys, { emoji, emojiUnified, emojiURL }]);
    setMessage((prevMessage) => `${prevMessage} ${emoji}`);
  };

  const handleInputFocus = () => {
    setIsEmojiPickerShow(false);
  };

  const handleShowEmojiPicker = () => {
    setIsEmojiPickerShow((prev) => !prev);
    if (isEmojiPickerShow) {
      messageInputRef.current.focus();
    } else {
      messageInputRef.current.blur();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("file") || !file.type.startsWith("image/")) {
return;
}
setFile(file);
};
const handleMessage = (e) => {
const { value } = e.target;
const isArabic = /[\u0600-\u06FF]/.test(value);
setIsArabic(isArabic);
if (value.length === 0) {
setIsArabic(true);
}
setMessage(value);
};
const handleBack = async () => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = getSelectedUser().uid;
    const uniqueChatId = getUniqueChatId(currentUserId, selectedUserId);
    const chatRef = doc(db, "messages", uniqueChatId);
    const docSnapshot = await getDoc(chatRef);
    if (docSnapshot.exists()) {
    const document = docSnapshot.data();
    if (Object.keys(document).length === 1) {
    await deleteDoc(chatRef);
    } else {
    if (currentUserId === document.sender) {
    await updateDoc(chatRef, { sender: deleteField() });
    } else {
    await updateDoc(chatRef, { receiver: deleteField() });
    }
    }
    }
    setSelectedUser(null);
    };
    return {
    messages,
    isMessagesLoaded,
    lastDoc,
    isLastDocExist,
    isBothUserConnected,
    images,
    scrollRef,
    messageInputRef,
    timeAgo,
    isArabic,
    file,
    setFile,
    emojys,
    sendMessage,
    fetchMoreMessages,
    deleteChat,
    updateLastSeen,
    handleEmojiPicker,
    handleInputFocus,
    handleShowEmojiPicker,
    handleFile,
    handleMessage,
    handleBack,
    initialMessagesLoaded,
    message,
    setMessage,
    isEmojiPickerShow,
    setIsEmojiPickerShow,
  };
};