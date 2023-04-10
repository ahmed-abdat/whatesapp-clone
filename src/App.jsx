import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Loading from "./components/Loading";
import NotFound from "./components/NotFound";
import Home from "./page/Home/Home";
import Welcoome from "./page/welcome/Welcoome";
import Otp from "./page/otp/Otp";
import SignUp from "./page/signUp/SignUp";
import User from "./components/User";
import useUser from "./store/useUser";
import UserInfo from "./page/userInfo/UserInfo";
import LoginPhone from "./page/loginPhone/LoginPhone";

function App() {
   // get curentUser
   const getCurrentUser = useUser(state => state.getCurrentUser)

   const user = getCurrentUser()


  const RequireAuth = ({ children }) => {
    return user  ? children : <Navigate to={"/welcoome"} />;
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>}>
          <Route path="/" element={<Loading />} />
        </Route>
        <Route path="/welcoome" element={<Welcoome />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="/user" element={<User />} />
        <Route path="/login" element={<LoginPhone />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
