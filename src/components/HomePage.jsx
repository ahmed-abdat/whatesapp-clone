import HomepageSearch from "./HomePage/HomePageSearch";
import HomePageUser from "./HomePage/HomePageUser";
import HomePageHeader from "./HomePage/HomePageHeader";
import useUser from "../store/useUser";
import { useEffect, useState } from "react";
import {
  collection,
  limit,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteField,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { lazy } from "react";
import { Suspense } from "react";
import SpinerLoader from "./SpinerLoader";
import useUsers from "../store/useUsers";

// lazy loade
const UserProfile = lazy(() => import("./UserProfile"));

export default function HomePage() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // is profile show
  const isProfileShow = useUsers((state) => state.isProfileShow);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const currentUser = getCurrentUser();

  // get logout loading
  const isLogoutLoading = useUser((state) => state.isLogoutLoading);

  const [lastMessage , setLastMessage] = useState([])

    // delete the current user from the all the chat view 
    const deleteTheCurrentUserFromAllChat = async () => {
      const q = query(collection(db, 'messages'))
    //  get all the chat
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach( (doc) => {
         // chcek if the current user is in the chat view whetever is it sender or receiver and update the chat view 
         const docData = doc.data()
         if(docData.sender === currentUser.uid || docData.receiver === currentUser.uid){
          const isSender = docData.sender === currentUser.uid
          // if the user is the sender delete the field sender and if the user is the receiver delete the field receiver
          if(isSender){
            updateDoc(doc.ref , {
              sender : deleteField()
            })
            .catch(err => console.log(err))
          }else {
            updateDoc(doc.ref , {
              receiver : deleteField()  
            })
            .catch(err => console.log(err))
          }
         
         }
      })
    }

  
  // function that handel update all the users with the last Message
  useEffect(() => {
    // delete the current user from the all the chat view
    deleteTheCurrentUserFromAllChat()
    const q = query(
      collection(db, "users" , currentUser.uid, "lastMessage")
    );
    const querySnapshot = onSnapshot(q, (querySnapshot) => {
      const lastMessages = [];
      querySnapshot.forEach((doce) => {
       lastMessages.push({ ...doce.data(), id: doce.id });
      });
      // console.log(lastMessages);
      setLastMessage(lastMessages);
    });

    return () => querySnapshot();
  }, []);
  
  // get all user in firebase except the current user
  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, "users"),
      where("uid", "!=", currentUser.uid),
      limit(10)
    );
    const querySnapshot = onSnapshot(q, (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doce) => {
        const qe = query(
          collection(db, "users" , currentUser.uid, "lastMessage")
        );
        let lastMessage = []
        getDocs(qe).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if(doc.exists()){
              lastMessage.push({ ...doc.data(), id: doc.id });
            }
          });

          setLastMessage(lastMessage)
        });

        users.push({ ...doce.data(), id: doce.id });
      });
      setAllUsers(users);
      setIsLoading(false);
    });
  
    return () => querySnapshot();
  }, []);




  // merge the lastMessage with the his user
  useEffect(() => {
    const users = allUsers.map(user => {
      const lastMessages = lastMessage.find(lastMessage => lastMessage.from === user.uid || lastMessage.to === user.uid)
      return {...user , lastMessage : lastMessages}
        })
        setAllUsers(users)
  }, [lastMessage])

  



  return (
    <div className="home-page">
      {isLogoutLoading ? (
        <div className="loader--conatainer d-f">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* profile */}
          {isProfileShow && (
            <Suspense fallback={<SpinerLoader />}>
              <UserProfile />
            </Suspense>
          )}
          {/* home page header */}
          <HomePageHeader />
          {/* home page search */}
          <HomepageSearch />
          {/* home page user profile */}
          <div className="user-profile--container">
            {!isLoading ? (
              allUsers.map((user) => {
                return <HomePageUser key={user.id} {...user} />;
              })
            ) : (
              <SpinerLoader />
            )}
          </div>
        </>
      )}
    </div>
  );
}
