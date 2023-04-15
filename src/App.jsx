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




const Home = lazy(() => import("./page/Home/Home"));
const Welcoome = lazy(() => import("./page/welcome/Welcoome"));
const Otp = lazy(() => import("./page/otp/Otp"));
const SignUp = lazy(() => import("./page/signUp/SignUp"));
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
        <Route path="/welcoome" element={<Suspense fallback={<Loading />}><Welcoome /></Suspense> } />
        <Route path="/signUp" element={<Suspense fallback={<Loading />}><SignUp /></Suspense> } />
        <Route path="/otp" element={<Suspense fallback={<Loading />}><Otp /></Suspense> }  />
        <Route path="/userInfo" element={<Suspense fallback={<Loading />}><UserInfo /></Suspense> } />
        <Route path="/login" element={<LoginPhone />} />
        <Route path="*" element={<Suspense fallback={<Loading />}><NotFound /></Suspense> }  />
      </Routes>
  </Router>
  );
}

export default App;
