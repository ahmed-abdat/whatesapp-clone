import { useContext, useState } from "react";

import WelcomePage from "./WelcomePage";
import SignUp from "./SignUp";
import {StateContext} from '../../context'

export default function Login() {

  const [isWelcomePage] = useContext(StateContext)
  // is welcomme page is true
  // const [isWelcomePage, setIsWelcomePage] = useState(true);
  return (
    <div className="login--container">
      {isWelcomePage ? (
        <WelcomePage />
      ) : (
        <SignUp />
      )}
    </div>
  );
}
