import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUsers from "../../store/useUsers";
import useUser from "../../store/useUser";
import { useEffect, useRef, useState } from "react";
import { app, auth, storage } from "../../config/firebase";
import { deleteUser, getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getFirestore,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  collection,
  getDocs,
  query,
  deleteField,
} from "firebase/firestore/lite";
import useSelectedUser from "../../store/useSelectedUser";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import DeleteModule from "../DeleteModule";
import "../styles/HeaderPopup.css";
import { deleteObject, ref } from "firebase/storage";

export default function HomePageHeader({ setIsAllUsersShow }) {
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // state
  const [isModuleshow, setIsModuleShow] = useState(false);

  const [isPopupShow, setIsPopupShow] = useState(false);
  const headerIconsRef = useRef(null);
  const popupContainerRef = useRef(null);

  // setIsLogoutLoading
  const setIsLogoutLoading = useUser((state) => state.setIsLogoutLoading);

  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  // set selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);

  // get isAnonymousUser
  const getIsAnonymousUser = useUser((state) => state.getIsAnonymousUser);

  // navigate
  const navigate = useNavigate();

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

  // set current user
  const setCurrentUser = useUser((state) => state.setCurrentUser);
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);
  const firestore = getFirestore(app);

  // delete the current user from the all the chat view
  const deleteTheCurrentUserFromAllChat = async () => {
    try {
      const q = query(collection(firestore, "messages"));
      //  get all the chat
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // chcek if the current user is in the chat view whetever is it sender or receiver and update the chat view
        const docData = doc.data();
        if (
          docData.sender === getCurrentUser().uid ||
          docData.receiver === getSelectedUser().uid
        ) {
          const isSender = docData.sender === getCurrentUser().uid;
          // if the user is the sender delete the field sender and if the user is the receiver delete the field receiver
          if (isSender) {
            updateDoc(doc.ref, {
              sender: deleteField(),
            }).catch((err) => console.log(err));
          } else {
            updateDoc(doc.ref, {
              receiver: deleteField(),
            }).catch((err) => console.log(err));
          }
        }
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  // handel signout
  const handelSignout = () => {
    setIsLogoutLoading(true);
    // signout the user
    if (getCurrentUser()?.uid && !getIsAnonymousUser()) {
      updateIsOnline();
    }
    if (getIsAnonymousUser()) {
      delteUsere();
      deleteLastMessageCollection();
    }
    deleteTheCurrentUserFromAllChat();
    setTimeout(() => {
      setIsSelectedUser(false);
      setSelectedUser(null);
      localStorage.clear();
      signOut(auth)
        .then(() => {
          setCurrentUser(null);
          console.log("signout succesfully");
          setIsLogoutLoading(false);
        })
        .catch((error) => {
          console.log(error.message);
        });
      navigate("/welcoome");
    }, 2000);
  };

  // delete anyonymous user account
  const delteUsere = async () => {
    const currentUserId = getCurrentUser().uid;
    const docRef = doc(firestore, "users", currentUserId);
    try {
      const auth = getAuth();
      await deleteDoc(docRef);
      await deleteUser(auth.currentUser);
      deleteImagProfile();
    } catch (error) {
      console.log(error.message);
    }
  };

  // delete user image
  const deleteImagProfile = async () => {
    if (!getCurrentUser()?.photoPath) return;
    const oldRef = ref(storage, getCurrentUser().photoPath);
    try {
      await deleteObject(oldRef);
      console.log("fill deleted successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // update the user isOnline property to true
  const updateIsOnline = async () => {
    try {
      const docRef = doc(firestore, "users", getCurrentUser().uid);
      await updateDoc(docRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // handel show all the users
  const handelShowAllTheUsers = () => {
    setIsAllUsersShow((prev) => !prev);
  };

  // handel go to profile
  const handelGoToProfile = () => {
    setIsPopupShow(false);
    setIsProfileShow(true);
  };

  // delet all Messages collection
  const deleteAllChatMessages = async (id) => {
    const currentUserId = getCurrentUser().uid;
    const lastMessageCollection = collection(
      firestore,
      "users",
      currentUserId,
      "messages",
      id,
      "chat"
    );
    getDocs(lastMessageCollection).then((snapshot) => {
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
          .then(() => console.log("document delte with succes"))
          .catch((e) => console.log(e.message));
      });
    });
  };

  // handel delet account
  const handelDeletAccount = async () => {
    const currentUserId = getCurrentUser().uid;
    const docRef = doc(firestore, "users", currentUserId);
    try {
      setIsLogoutLoading(true);
      deleteTheCurrentUserFromAllChat();
      // delete the user from the database
      await deleteDoc(docRef);
      const auth = getAuth();
      await deleteUser(auth.currentUser);
      deleteImagProfile();
      // delete the lastMessage collection of the user
      deleteLastMessageCollection();
      // signout the user
      setTimeout(() => {
        setSelectedUser(null);
        localStorage.clear();
        signOut(auth)
          .then(() => {
            setCurrentUser(null);
            console.log("signout succesfully");
            setIsLogoutLoading(false);
          })
          .catch((error) => {
            console.error(error.message);
          });
        navigate("/welcoome");
      }, 2500);
    } catch (error) {
      console.error(error.message);
    }
  };

  // delete the lastMessage collection of the user
  const deleteLastMessageCollection = async () => {
    try {
      const currentUserId = getCurrentUser().uid;
      const lastMessageCollection = collection(
        firestore,
        "users",
        currentUserId,
        "lastMessage"
      );
      getDocs(lastMessageCollection).then((snapshot) => {
        let arr = [];
        snapshot.forEach(async (doc) => {
          arr.push(doc.id);
          await deleteDoc(doc.ref);
        });
        arr?.map((userID) => deleteAllChatMessages(userID));
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  // handel show module
  const handelShowModel = () => {
    setIsModuleShow(true);
    setIsPopupShow(false);
  };

  // handel close module
  const handelCloseModule = () => {
    setIsModuleShow(false);
  };

  return (
    <header>
      <div className="header--container">
        <div className="header--logo" onClick={() => setIsProfileShow(true)}>
          <img src={getCurrentUser()?.photoURL || defaultAvatar} alt="avatar" />
        </div>
        <div className="header--icons" ref={headerIconsRef}>
          <BsFillChatRightTextFill onClick={handelShowAllTheUsers} />
          <div className="d-f">
            <HiDotsVertical
              onClick={() => setIsPopupShow((prev) => !prev)}
              className={isPopupShow ? "bg--hover" : ""}
            />
          </div>
        </div>
      </div>
      {isPopupShow && (
        <div className="popup--container" ref={popupContainerRef}>
          <ul className="popup--item f-ar">
            <li onClick={handelGoToProfile}> الملف الشخصي </li>
            <li
              onClick={getIsAnonymousUser() ? handelShowModel : handelSignout}
            >
              تسجيل الخروج
            </li>
            {!getIsAnonymousUser() && (
              <li onClick={handelShowModel}> حذف حسابك </li>
            )}
          </ul>
        </div>
      )}
      {isModuleshow && getIsAnonymousUser() ? (
        <DeleteModule
          handelCancel={handelCloseModule}
          handelDelete={handelSignout}
          moduleTitle="delete geust account"
        />
      ) : (
        isModuleshow && (
          <DeleteModule
            handelCancel={handelCloseModule}
            handelDelete={handelDeletAccount}
          />
        )
      )}
    </header>
  );
}
