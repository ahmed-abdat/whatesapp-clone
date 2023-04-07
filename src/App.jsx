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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<Loading />} />
        </Route>
        <Route path="/welcoome" element={<Welcoome />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/user" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
