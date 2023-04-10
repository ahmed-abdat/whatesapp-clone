import { ToastContainer, toast } from "react-toastify";
import "./loginPhone.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPhone() {
  // state
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // navigate
  const navigate = useNavigate();

  return (
    <div className="userInfo dr-ar">
      <form>
        <div className="header">
          <h2> المعلومات الشخصية </h2>
        </div>
        <div className="input phone">
          <label htmlFor="phoneNumber"> رقم الهاتف</label>
          <input
            type="text"
            placeholder="أدخل رقم هاتفك هنا"
            id="phoneNumber"
            // onChange={handelPhone}
            value={phoneNumber}
            // disabled={getIsEmailUser() ? false : true}
          />
        </div>
        {/* password for user phone */}
        <div className="input phone">
          <label htmlFor="password"> كلمة السر</label>
          <input
            type="text"
            placeholder="أدخل كلمة السر هنا"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <ToastContainer
          position="top-center"
          autoClose={4000}
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
          <button className="btn cancel"> إلغاء </button>
          <button className="send">تسجيل الدخول</button>
        </div>
      </form>
    </div>
  );
}
