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
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { lazy } from "react";
import { Suspense } from "react";
import SpinerLoader from "./SpinerLoader";
import useUsers from "../store/useUsers";
import { BsFillChatRightTextFill } from "react-icons/bs";
import ViewAllUsersHeader from "./HomePage/ViewAllUsersHeader";

// lazy loade
const UserProfile = lazy(() => import("./UserProfile"));

export default function HomePage() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [freindsList, setFreindsList] = useState([]);

  const [isAllUsersShow, setIsAllUsersShow] = useState(false);

  // is profile show
  const isProfileShow = useUsers((state) => state.isProfileShow);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const currentUser = getCurrentUser();

  // get logout loading
  const isLogoutLoading = useUser((state) => state.isLogoutLoading);

  const [lastMessage, setLastMessage] = useState([]);

  // delete the current user from the all the chat view
  const deleteTheCurrentUserFromAllChat = async () => {
    const q = query(collection(db, "messages"));
    //  get all the chat
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // chcek if the current user is in the chat view whetever is it sender or receiver and update the chat view
      const docData = doc.data();
      if (
        docData.sender === currentUser.uid ||
        docData.receiver === currentUser.uid
      ) {
        const isSender = docData.sender === currentUser.uid;
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
  };

  // function that handel update all the users with the last Message
  useEffect(() => {
    // delete the current user from the all the chat view
    deleteTheCurrentUserFromAllChat();
    const q = query(collection(db, "users", currentUser.uid, "lastMessage"));
    const querySnapshot = onSnapshot(q, (querySnapshot) => {
      const lastMessages = [];
      querySnapshot.forEach((doce) => {
        lastMessages.push({ ...doce.data(), id: doce.id });
      });
      setLastMessage(lastMessages);
    });

    return () => querySnapshot();
  }, []);

  // get all user in firebase except the current user

  useEffect(() => {
    setIsLoading(true);

    const qe = query(collection(db, "users", currentUser.uid, "lastMessage"));
    let lastMessages = [];
    getDocs(qe).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          lastMessages.push({ ...doc.data(), id: doc.id });
        }
      });
      setLastMessage(lastMessages);
    });

    // First, get the list of friend UIDs for the current user
    const friendListRef = collection(
      db,
      "users",
      currentUser.uid,
      "freindsList"
    );
    const friendListQuery = query(friendListRef);
    const friendListSnapshot = onSnapshot(friendListQuery, (querySnapshot) => {
      const freindLists = [];
      querySnapshot.forEach((doc) => {
        if(doc.exists()) {
          freindLists.push(doc.data().uid);
        }
      });

      setFreindsList(freindLists);

      // Then, get the user data for each friend UID
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("uid", '!=' , currentUser.uid));
      const usersSnapshot = onSnapshot(usersQuery, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            users.push({ ...doc.data(), id: doc.id });
          }
        });

        // filter the users that are in the friend list
        const filteredUsers = users.filter((user) => {
          return freindLists.includes(user.uid);
        } 
        );

        const frendsUsers = filteredUsers.map((user) => {
          const lastMessagese = lastMessages.find(message => message.from === user.uid || message.to === user.uid);
          return { ...user, lastMessage: lastMessagese };
        });

        setAllUsers(users)

        setFreindsList(frendsUsers);
        setIsLoading(false);
      
      });
      return () => usersSnapshot();
    });
    return () => friendListSnapshot();
  }, []);

  // merge the lastMessage with the his user
  useEffect(() => {
    // console.log(filteredUsers);
    const users = freindsList.map((user) => {
      const lastMessages = lastMessage.find(
        (lastMessage) =>
          lastMessage.from === user.uid || lastMessage.to === user.uid
      );
      return { ...user, lastMessage: lastMessages };
    });
    setFreindsList(users);
  }, [lastMessage]);

  // add event listener to know if the use view the page or not
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // update isOnline to false 
        updateDoc(doc(db, "users", currentUser.uid), {
          isOnline: true,
          lastSeen : new Date().getTime()
        }).catch((err) => console.log(err));
      }else {
      // delete the current user from the all the chat view
        deleteTheCurrentUserFromAllChat();
        // update isOnline to false
        updateDoc(doc(db, "users", currentUser.uid), {
          isOnline: false,
          lastSeen : new Date().getTime()
        }).catch((err) => console.log(err));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);



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
          {
            isAllUsersShow ?  (
              <ViewAllUsersHeader setIsAllUsersShow={setIsAllUsersShow}/>
            ) : (
              <HomePageHeader setIsAllUsersShow={setIsAllUsersShow} />
            )
          }
          {/* home page search */}
          <HomepageSearch />
          {/* home page user profile */}
          
          {
            isAllUsersShow ? (
              <div className="user-profile--container">
            {!isLoading ? (
              allUsers.map((user) => {
                return <HomePageUser key={user.id} {...user} />;
              })
            ) : (
              <SpinerLoader />
            )}
          </div>
            ): (
             <>
              <div className="button" onClick={() => setIsAllUsersShow(true)}>
                <button >
                  <BsFillChatRightTextFill />
                </button>
              </div>
              <div className="user-profile--container"> 
              
            {!isLoading ? (
              freindsList.map((user) => {
                return <HomePageUser key={user.id} {...user} />;
              })
            ) : (
              <SpinerLoader />
            )}
          </div>
             </>
            )
          }
        </>
      )}
    </div>
  );
}
