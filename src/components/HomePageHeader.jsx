import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import { useEffect, useRef, useState } from "react";
import "./styles/HeaderPopup.css";
import { app, auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
import useSelectedUser from "../store/useSelectedUser";
import defaultAvatar from "../assets/img/default-avatar.svg";

export default function HomePageHeader() {
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  const [isPopupShow, setIsPopupShow] = useState(false);
  const headerIconsRef = useRef(null);
  const popupContainerRef = useRef(null);

  // setIsLogoutLoading
  const setIsLogoutLoading = useUser((state) => state.setIsLogoutLoading);

  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  // set selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);


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

  // handel signout
  const handelSignout = () => {
    setIsLogoutLoading(true);
    // signout the user
    if (getCurrentUser()?.uid) {
      updateIsOnline();
    }
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

  // update the user isOnline property to true
  const updateIsOnline = async () => {
    try {
      const firestore = getFirestore(app)
      const docRef = doc(firestore, "users", getCurrentUser().uid);
      await updateDoc(docRef, {
        isOnline: false,
        lastSeen: new Date().getTime(),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

 



  return (
    <header>
      <div className="header--container">
        <div className="header--logo" onClick={() => setIsProfileShow(true)}>
          <img
            src={ getCurrentUser() ? getCurrentUser().photoURL : defaultAvatar}
            alt="avatar"
          />
        </div>
        <div className="header--icons" ref={headerIconsRef}>
          <BsFillChatRightTextFill />
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
            <li> مجموعة جديدة </li>
            <li>الإعدادات</li>
            <li onClick={handelSignout}>تسجيل الخروج</li>
          </ul>
        </div>
      )}
    </header>
  );
}
