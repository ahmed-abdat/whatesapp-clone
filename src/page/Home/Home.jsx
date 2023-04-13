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




export default function Home() {
  // set all users
  const setAllUsers = useUsers((state) => state.setAllUsers);
   // get all users
 const allUsers = useUsers((state) => state.allUsers);

//  set the isOnline 
const setIsOnline = useUsers((state) => state.setIsOnline);


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
      if(getCurrentUser()?.isOnline){
        updateDoc(doc(db, "users", getCurrentUser().uid), {
          isOnline: true,
          latestSean : serverTimestamp()
        }).catch((error) => {
          console.log(error.message);
        });
      }
    }
    
    function handleOffline() {
      if(getCurrentUser()?.isOnline){
        console.log(`${getCurrentUser().displayName} is offline`);
        updateDoc(doc(db, "users", getCurrentUser().uid), {
          isOnline: false,
          latestSean : serverTimestamp()
        }).catch((error) => {
          console.log(error.message);
        });
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


  return (
    <div className="large-screen">
    <div className="green-nav"> </div>
  {
    allUsers.length ? (  <main className="main--container">
    {/* home page */}
    <HomePage />
    {/* chat page */}
    <ChatPage />
  </main>) : <Loading />
  }
  </div>
  );
}
