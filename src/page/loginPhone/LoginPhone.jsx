import { ToastContainer, toast } from "react-toastify";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";
import { useEffect } from "react";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./login.css";

export default function LoginPhone() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  //  set current user
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  // sete the phoneUserVerified
  const setIsPhoneUserVerified = useUser(
    (state) => state.setIsPhoneUserVerified
  );

  // get isEmailUser
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // state
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // navigate
  const navigate = useNavigate();

  // password input Ref
  const passwordInputRef = useRef();

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // check if password is correct
    if (password === getCurrentUser().password) {
      // update the user isOnline status
      updateDoc(doc(db, "users", getCurrentUser().uid), {
        isOnline: true,
        lastSeen: new Date().getTime(),
      }).catch((error) => {
        console.log(error.message);
      });
      setIsPhoneUserVerified(true);
      // navigate to home page
      toast.success("مرحبا بعودتك ", {
        autoClose: 1000,
      });
      setTimeout(() => {
        navigate("/");
        setIsLoading(false);
      }, 1600);
    } else if (password === "") {
      setIsPhoneUserVerified(false);
      setIsLoading(false);
      toast.error("أدخل كلمة السر");
      passwordInputRef.current.focus();
    } else {
      setIsLoading(false);
      setIsPhoneUserVerified(false);
      // show error message
      toast.error("كلمة السر غير صحيحة");
    }
  };

  // handle cancel
  const handelCancel = () => {
    // navigate back to signup page
    navigate("/signUp");
    // clear the current user
    setCurrentUser(null);
  };

  // if the user is phone user
  useEffect(() => {
    if (getIsEmailUser() && getCurrentUser()) {
      navigate("/");
    }

    setIsPhoneUserVerified(false);
  }, []);

  return (
    <div className="userInfo dr-ar">
      <form onSubmit={handleSubmit}>
        <div className="header">
          <div className="img image d-f">
            <img
              src={
                getCurrentUser()?.photoURL
                  ? getCurrentUser().photoURL
                  : "/default-avatar.svg"
              }
              alt="avatar"
            />
          </div>
          <div className="info">
            <h3>{getCurrentUser()?.displayName}</h3>
          </div>
        </div>
        {/* password for user phone */}
        <div className="input phone">
          <input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="أدخل كلمة السر هنا"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            ref={passwordInputRef}
          />
          {isPasswordVisible ? (
            <BsFillEyeFill
              className="open-eye"
              onClick={() => setIsPasswordVisible(false)}
            />
          ) : (
            <BsFillEyeSlashFill
              className="close-eye"
              onClick={() => setIsPasswordVisible(true)}
            />
          )}
        </div>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={2}
        />
        <div className="btnes">
          <button
            type="button"
            className="btn cancel"
            onClick={handelCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button className="send" disabled={isLoading}>
            تسجيل الدخول
          </button>
        </div>
      </form>
    </div>
  );
}
