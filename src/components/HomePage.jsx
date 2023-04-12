
import useUser from "../store/useUser";
import HomePageHeader from "./HomePageHeader";
import HomepageSearch from "./HomepageSearch";

export default function HomePage() {
  // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  return (
    <div className="home-page">
      {/* home page header */}
      <HomePageHeader />
      {/* home page search */}
      <HomepageSearch />
    </div>
  );
}
