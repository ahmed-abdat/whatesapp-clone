import { ToastContainer, toast } from "react-toastify";
import "./loginPhone.css";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";

export default function LoginPhone() {
   // get current user
   const getCurrentUser = useUser((state) => state.getCurrentUser);
  //  set current user
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  // sete the phoneUserVerified
  const setIsPhoneUserVerified = useUser((state) => state.setIsPhoneUserVerified);

  // state
  const [password, setPassword] = useState("");

  // navigate
  const navigate = useNavigate();

  // password input Ref
  const passwordInputRef = useRef();

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // check if password is correct
    if (password === getCurrentUser().password) {
      setIsPhoneUserVerified(true)
      // navigate to home page
      toast.success("مرحبا بعودتك ",{
        autoClose: 1300,
      });
      setTimeout(() => {
        navigate("/user");
      }, 2000);
    } else if(password === ""){
      setIsPhoneUserVerified(false)
      toast.error("أدخل كلمة السر");
      passwordInputRef.current.focus();
      } else {
      setIsPhoneUserVerified(false)
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




  return (
    <div className="userInfo dr-ar">
      <form onSubmit={handleSubmit}>
        <div className="header">
          <div className="img image d-f">
            <img src={getCurrentUser()?.photoURL ? getCurrentUser().photoURL : 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'} alt="avatar" />
          </div>
          <div className="info">
            <h3>{getCurrentUser()?.displayName}</h3>
          </div>
        </div>
        {/* password for user phone */}
        <div className="input phone">
          <input
            type="text"
            placeholder="أدخل كلمة السر هنا"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            ref={passwordInputRef}
          />
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
          <button type="button" className="btn cancel" onClick={handelCancel}> إلغاء </button>
          <button className="send">تسجيل الدخول</button>
        </div>
      </form>
    </div>
  );
}
