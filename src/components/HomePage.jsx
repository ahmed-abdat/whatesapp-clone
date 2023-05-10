import HomepageSearch from "./HomePage/HomePageSearch";
import HomePageUser from "./HomePage/HomePageUser";
import HomePageHeader from "./HomePage/HomePageHeader";
import useUser from "../store/useUser";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteField,
  getDocs,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { lazy } from "react";
import { Suspense } from "react";
import SpinerLoader from "./SpinerLoader";
import useUsers from "../store/useUsers";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";
import ViewAllUsersHeader from "./HomePage/ViewAllUsersHeader";
import useSelectedUser from "../store/useSelectedUser";
import NoSearchFound from "./HomePage/NoSearchFound";
import { useRef } from "react";

// lazy loade
const UserProfile = lazy(() => import("./UserProfile"));
const NoFreinds = lazy(() => import("./HomePage/NoFreinds"));

export default function HomePage() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [freindsList, setFreindsList] = useState([]);
  const [isUnreadMessage, setIsUnreadMessage] = useState(false);
  const [isBtnTextShow, setIsBtnTextShow] = useState(false);
  const [search, setSearch] = useState("");

  const btnMessageRef = useRef(null);

  // isAllUsersShow
  const isAllUsersShowe = useUsers((state) => state.isAllUsersShow);
  // set isAllUsersShow
  const setIsAllUsersShowe = useUsers((state) => state.setIsAllUsersShow);

  // is profile show
  const isProfileShow = useUsers((state) => state.isProfileShow);

  // set currrent user
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const currentUser = getCurrentUser();

  // get selcted user
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);

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

  // update how view the chat content
  const howIsView = (uid) => {
    const currentUserId = getCurrentUser().uid;
    const selectedUserId = uid;
    const uniqueChatId =
      currentUserId > selectedUserId
        ? `${currentUserId + selectedUserId}`
        : `${selectedUserId + currentUserId}`;
    const chatRef = doc(db, "messages", uniqueChatId);
    getDoc(chatRef).then((doc) => {
      if (doc.exists() && doc.data().hasOwnProperty("sender")) {
        const document = doc.data();
        const isCurrentUserViewThisChat = document.sender === currentUserId;
        if (isCurrentUserViewThisChat) return;
        updateDoc(chatRef, {
          receiver: currentUserId,
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      } else {
        setDoc(chatRef, {
          sender: currentUserId,
        }).catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
      }
    });
  };

  // function that handel update all the users with the last Message
  useEffect(() => {
    // delete the current user from the all the chat view
    deleteTheCurrentUserFromAllChat();
    const q = query(
      collection(db, "users", currentUser.uid, "lastMessage"),
      orderBy("createdAt", "desc")
    );
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
    const qe = query(
      collection(db, "users", currentUser.uid, "lastMessage"),
      orderBy("createdAt", "desc")
    );
    let lastMessages = [];
    getDocs(qe).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          lastMessages.push({ ...doc.data(), id: doc.id });
        }
      });
      setLastMessage(lastMessages);
    });

    // Then, get the user data for each friend UID
    const usersRef = collection(db, "users");
    const usersQuery = query(
      usersRef,
      where("uid", "!=", currentUser.uid),
      limit(20)
    );
    const usersSnapshot = onSnapshot(usersQuery, (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          users.push({ ...doc.data(), id: doc.id });
        }
      });

      // filter the users by lastSean
      users.sort(
        (a, b) => b.lastSeen.seconds * 1000 - a.lastSeen.seconds * 1000
      );
      const sortedUsers = lastMessages.map((message) => {
        const findUser = users.find(
          (user) => user.uid === message.from || user.uid === message.to
        );

        return { ...findUser, lastMessage: message };
      });
      const filteredUsers = sortedUsers.filter(
        (user) => user.displayName !== undefined
      );
      setAllUsers(users);
      setFreindsList(filteredUsers);
      setIsLoading(false);
    });
    return () => usersSnapshot();
  }, []);

  // merge the lastMessage with the his user
  useEffect(() => {
    // console.log(filteredUsers);
    const usersFilter = lastMessage.map((message) => {
      const findUser = allUsers.find(
        (user) => user.uid === message.from || user.uid === message.to
      );
      return { ...findUser, lastMessage: message };
    });
    const filteredUsers = usersFilter.filter(
      (user) => user.displayName !== undefined
    );
    setFreindsList(filteredUsers);
  }, [lastMessage]);

  const selectedUser = getSelectedUser();

  // add event listener to know if the use view the page or not
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        deleteTheCurrentUserFromAllChat();
        // update isOnline to false
        updateDoc(doc(db, "users", getCurrentUser().uid), {
          isOnline: false,
          lastSeen: serverTimestamp(),
        }).catch((err) => console.log(err));
      } else {
        // update how is view the chat
        if (getSelectedUser()?.uid) {
          howIsView(getSelectedUser().uid);
        }
        // update isOnline to true
        updateDoc(doc(db, "users", getCurrentUser().uid), {
          isOnline: true,
          lastSeen: serverTimestamp(),
        }).catch((err) => console.log(err));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // listen if the selcted user is changed
  useEffect(() => {
    if (selectedUser) {
      howIsView(selectedUser.uid);
    }
  }, [selectedUser]);

  // after 3 second set the btn text show to true
  useEffect(() => {
    const timer = setTimeout(() => {
      // scroll to the btn Message Ref
      if (freindsList.length < 1) {
        setIsBtnTextShow(true);
        btnMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // filter the freind list so show only the unread message from the other useres
  const filterFreinds = freindsList.map(
    (user) =>
      user?.lastMessage.from !== getCurrentUser().uid &&
      user?.lastMessage.isRead === false
  );

  // filter search function
  const filetrSearch = (users) => {
    return users.filter((user) => {
      return (
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        user?.phoneNumber?.includes(search)
      );
    });
  };

  // update the isOnline property in the user doc
  useEffect(() => {
    if (currentUser) {
      updateDoc(doc(db, "users", currentUser.uid), {
        isOnline: true,
        lastSeen: serverTimestamp(),
      }).catch((err) => console.error(err));
    }
  }, []);


  return (
    <div className="home-page">
      {isLogoutLoading ? (
        <SpinerLoader />
      ) : (
        <>
          {/* profile */}
          {isProfileShow && (
            <Suspense fallback={<SpinerLoader />}>
              <UserProfile />
            </Suspense>
          )}
          {/* home page header */}
          {isAllUsersShowe ? (
            <ViewAllUsersHeader
              setIsAllUsersShow={setIsAllUsersShowe}
              usersLength={allUsers.length}
            />
          ) : (
            <HomePageHeader setIsAllUsersShow={setIsAllUsersShowe}/>
          )}
          {/* home page search */}
          <HomepageSearch
            isUnreadMessageShow={!isAllUsersShowe}
            isUnreadMessage={isUnreadMessage}
            setIsUnreadMessage={setIsUnreadMessage}
            search={search}
            setSearch={setSearch}
          />

          {/* home page user profile */}

          {isAllUsersShowe ? (
            <div className="user-profile--container">
              {!isLoading ? (
                search.length > 0 ? (
                  filetrSearch(allUsers).length > 0 ? (
                    filetrSearch(allUsers).map((user) => {
                      return <HomePageUser key={user.uid} {...user} />;
                    })
                  ) : (
                    <NoSearchFound />
                  )
                ) : (
                  allUsers.map((user) => {
                    return <HomePageUser key={user.uid} {...user} />;
                  })
                )
              ) : (
                <SpinerLoader />
              )}
            </div>
          ) : (
            <>
              <div
                className={`button ${
                  isBtnTextShow && freindsList.length < 1 ? "with-text" : ""
                }`}
                ref={btnMessageRef}
                onClick={() => setIsAllUsersShowe(true)}
              >
                <button
                  className={`${
                    isBtnTextShow && freindsList.length < 1 ? "with-text" : ""
                  }`}
                >
                  <p className="d-f f-ar">
                    <HiChatBubbleBottomCenterText />
                    {isBtnTextShow && freindsList.length < 1 && "إرسال رسالة"}
                  </p>
                </button>
              </div>
              <div className="user-profile--container">
                {!isLoading ? (
                  freindsList.length > 0 ? (
                    search.length < 1 && isUnreadMessage ? (
                      filterFreinds.map((user) => {
                        return <HomePageUser key={user.id} {...user} />;
                      })
                    ) : search.length > 0 && isUnreadMessage ? (
                      filetrSearch(filterFreinds).length > 0 ? (
                        filetrSearch(filterFreinds).map((user) => {
                          return <HomePageUser key={user.id} {...user} />;
                        })
                      ) : (
                        <NoSearchFound />
                      )
                    ) : search.length > 0 && !isUnreadMessage ? (
                      filetrSearch(freindsList).length > 0 ? (
                        filetrSearch(freindsList).map((user) => {
                          return <HomePageUser key={user.id} {...user} />;
                        })
                      ) : (
                        <NoSearchFound />
                      )
                    ) : (
                      freindsList.map((user) => {
                        return <HomePageUser key={user.id} {...user} />;
                      })
                    )
                  ) : (
                    <Suspense fallback={<SpinerLoader />}>
                      <NoFreinds allUser={allUsers} />
                    </Suspense>
                  )
                ) : (
                  <SpinerLoader />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
