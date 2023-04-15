import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import  { lazy, Suspense } from "react";
import Loading from "./components/Loading";
import useUser from "./store/useUser";
import LoginPhone from "./page/loginPhone/LoginPhone";
import Welcoome from "./page/welcome/Welcoome";
import Otp from "./page/otp/Otp";
import SignUp from "./page/signUp/SignUp";


const Home = lazy(() => import("./page/Home/Home"));
const UserInfo = lazy(() => import("./page/userInfo/UserInfo"));
const NotFound = lazy(() => import("./components/NotFound"));




function App() {
  const getCurrentUser = useUser(state => state.getCurrentUser)
  const getIsPhoneUserVerified = useUser(state => state.getIsPhoneUserVerified)
  const getIsEmailUser = useUser(state => state.getIsEmailUser)
  
  function RequireAuth({ children }) {
  
    return (getCurrentUser() && getIsPhoneUserVerified()) || (getCurrentUser() && getIsEmailUser()) ? children : <Navigate to={"/welcoome"} />;
  }
  

  return (
    <Router>
    
      <Routes>
        <Route path="/" element={<RequireAuth><Suspense fallback={<Loading />}><Home /></Suspense></RequireAuth>} />
        <Route path="/welcoome" element={<Welcoome />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/otp" element={<Otp /> }  />
        <Route path="/userInfo" element={<Suspense fallback={<Loading />}><UserInfo /></Suspense> } />
        <Route path="/login" element={<LoginPhone />} />
        <Route path="*" element={<NotFound /> }  />
      </Routes>
  </Router>
  );
}

export default App;
