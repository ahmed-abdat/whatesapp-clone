import { ToastContainer, toast } from "react-toastify";
import "./loginPhone.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../store/useUser";

export default function LoginPhone() {
   // get current user
   const getCurrentUser = useUser((state) => state.getCurrentUser);
  //  set current user
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  // state
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(getCurrentUser()?.phoneNumber || "");

  // navigate
  const navigate = useNavigate();

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // check if password is correct
    if (password === getCurrentUser().password) {
      // navigate to home page
      toast.success("مرحبا بعودتك ");
      setTimeout(() => {
        navigate("/user");
      }, 1600);
    } else {
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
          {/* <h2> تسجيل الدخول </h2> */}
          <div className="img image d-f">
            <img src={getCurrentUser() ? getCurrentUser().photoURL : '/whatsapp-logo.svg'} alt="" />
          </div>
          <div className="info">
            <h3>{getCurrentUser().displayName}</h3>
          </div>
        </div>
        {/* <div className="input phone">
          <label htmlFor="phoneNumber"> رقم الهاتف</label>
          <input
            type="text"
            placeholder="أدخل رقم هاتفك هنا"
            id="phoneNumber"
            onChange={()=> setPhoneNumber(e.target.value)}
            value={phoneNumber}
            disabled={true}
          />
        </div> */}
        {/* password for user phone */}
        <div className="input phone">
          {/* <label htmlFor="password"> كلمة السر</label> */}
          <input
            type="text"
            placeholder="أدخل كلمة السر هنا"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
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
          theme="colored"
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
