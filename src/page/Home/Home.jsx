import { Link, Outlet } from "react-router-dom";
import "./home.css";
import HomePage from "../../components/HomePage";
import ChatPage from "../../components/ChatPage";
import useUsers from "../../store/useUsers";
import useUser from "../../store/useUser";
import { useEffect } from "react";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import Loading from '../../components/Loading'
import useSelectedUser from "../../store/useSelectedUser";
import ChatPageUser from "../../components/ChatPageUser";
import { useState } from "react";




export default function Home() {
  // set all users
  const setAllUsers = useUsers((state) => state.setAllUsers);
   // get all users
 const allUsers = useUsers((state) => state.allUsers);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);


   // get all user in firebase except the current user
   useEffect(() => {
    const q = query(collection(db, "users"), where("uid", "!=", getCurrentUser().uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usereData = [];
      querySnapshot.forEach((doc) => {
          usereData.push({...doc.data() ,  id: doc.id});
      });
     setAllUsers(usereData)
    })
    return () => {
      unsubscribe()
    }
  }, [])
   // connection status
   useEffect(() => {
    function handleOnline() {
      console.log(`${getCurrentUser().displayName} is online`);
        updateDoc(doc(db, "users", getCurrentUser().uid), {
          isOnline: true,
          lastSeen : new Date().getTime()
        }).catch((error) => {
          console.log(error.message);
        });
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // selected user
  const selectedUser = useSelectedUser((state) => state.selectedUser);





  return (
    <div className="large-screen">
    <div className="green-nav"> </div>
  {
    allUsers.length > 0 ? (  <main className="main--container">
    {/* home page */}
    <HomePage />
    {/* chat page */}
    {
      selectedUser ? (
        <ChatPageUser />
      ) : (<ChatPage />)
    }
  </main>) : <Loading />
  }
  </div>
  );
}
