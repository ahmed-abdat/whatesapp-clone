import HomePageHeader from "./HomePageHeader";
import HomepageSearch from "./HomePageSearch";
import HomePageUser from "./HomePageUser";
import useUsers from "../store/useUsers";
import UserProfile from "./UserProfile";

export default function HomePage() {

 // get all users
 const allUsers = useUsers((state) => state.allUsers);

//  is profile show 



  return (
    <div className="home-page">
      {/* profile */}
      <UserProfile />
      {/* home page header */}
      <HomePageHeader />
      {/* home page search */}
      <HomepageSearch />
      {/* home page user profile */}
      <div className="user-profile--container">
      {allUsers.length > 0 && allUsers.map((user) => (
        <HomePageUser key={user.id} {...user} />
      ))}
      </div>
    </div>
  );
}
