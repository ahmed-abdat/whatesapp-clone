import { useState } from "react";

import WelcomePage from "./WelcomePage";
import SignUp from "./SignUp";

export default function Login() {
  // is welcomme page is true
  const [isWelcomePage, setIsWelcomePage] = useState(true);
  return (
    <div className="login--container">
      {isWelcomePage ? (
        <WelcomePage setIsWelcomePage={setIsWelcomePage} />
      ) : (
        <SignUp />
      )}
    </div>
  );
}
