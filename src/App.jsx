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
const Welcoome = lazy(() => import("./page/welcome/Welcoome"));
const Otp = lazy(() => import("./page/otp/Otp"));
const SignUp = lazy(() => import("./page/signUp/SignUp"));
const UserInfo = lazy(() => import("./page/userInfo/UserInfo"));
const LoginPhone = lazy(() => import("./page/loginPhone/LoginPhone"));
const NotFound = lazy(() => import("./components/NotFound"));




function App() {
  const getCurrentUser = useUser(state => state.getCurrentUser)
  const getIsPhoneUserVerified = useUser(state => state.getIsPhoneUserVerified)
  const getIsEmailUser = useUser(state => state.getIsEmailUser)
  const currentUser = getCurrentUser()
  const phoneVerifie = getIsPhoneUserVerified()
  const isEmailUser = getIsEmailUser()

  
  function RequireAuth({ children }) {
  
    return (currentUser && phoneVerifie) || (currentUser && isEmailUser) ? children : <Navigate to={"/welcoome"} />;
  }
  

  return (
    <Router>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/welcoome" element={<Welcoome />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="/login" element={<LoginPhone />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Router>
  );
}

export default App;
