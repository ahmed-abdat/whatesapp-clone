import HomepageSearch from "./HomePageSearch";
import HomePageUser from "./HomePageUser";
import HomePageHeader from "./HomePageHeader";
import useUser from "../store/useUser";
import { useEffect, useState } from "react";
import {
  collection,
  limit,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db} from "../config/firebase";
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

  // get all user in firebase except the current user
  useEffect(() => {
    setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("uid", "!=", currentUser.uid),
        limit(6)
      );
      const querySnapshot = onSnapshot(q, (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({...doc.data() , id: doc.id});
      });
      setAllUsers(users);
      setIsLoading(false);
    });
    return () => querySnapshot();
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
