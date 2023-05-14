import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import  { lazy, Suspense } from "react";
import Loading from "./components/Loading";
import useUser from "./store/useUser";


const Home = lazy(() => import("./page/Home/Home"));
const UserInfo = lazy(() => import("./page/userInfo/UserInfo"));
const NotFound = lazy(() => import("./components/NotFound"));
const Otp = lazy(() => import("./page/otp/Otp"));
const SignUp = lazy(() => import("./page/signUp/SignUp"));
const Welcoome = lazy(() => import("./page/welcome/Welcoome"));




function App() {
  const getCurrentUser = useUser(state => state.getCurrentUser)
  const getIsPhoneUserVerified = useUser(state => state.getIsPhoneUserVerified)
  const getIsEmailUser = useUser(state => state.getIsEmailUser)
  const getIsAnonymousUser = useUser((state) => state.getIsAnonymousUser)
  
  function RequireAuth({ children }) {
  
    return (getCurrentUser() && getIsPhoneUserVerified()) || (getCurrentUser() && getIsEmailUser()) || (getCurrentUser() && getIsAnonymousUser())  ? children : <Navigate to={"/welcoome"} />;
  }
  

  return (
    <Router>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/welcoome" element={<Welcoome />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/otp" element={<Otp /> }  />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="*" element={<NotFound /> }  />
      </Routes>
      </Suspense>
  </Router>
  );
}

export default App;
