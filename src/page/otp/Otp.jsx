import { useEffect, useState } from "react";
import "./Opt.css";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useSignUp from "../../store/useSignUp";
import useUser from "../../store/useUser";

export default function Otp({}) {
  const confirmationResult = useSignUp((state) => state.confirmationResult);
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const getPhone = useSignUp((state) => state.getPhone);

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpVerifie, setIsotpVerifie] = useState(false);

  const navigate = useNavigate();

  const handleOtpChange = (element, index) => {
    // If the entered value is not a number, don't update the state
    if (isNaN(element.value)) return false;
    // Update the state with the new entered value
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    // If the last input is filled, blur and disable the input
    if (index === otp.length - 1) {
      element.blur();
      setIsotpVerifie(true);
      return;
    }
    // Otherwise focus the next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // clear OTP
  const clearOtp = () => {
    setOtp(new Array(6).fill(""));
    setIsotpVerifie(false);
  };

  //

  const handelSubmit = (e) => {
    e.preventDefault();
    confirmationResult
      .confirm(otp.join(''))
      .then((result) => {
        setCurrentUser(result.user);
        toast.success("تمت المصادقة", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setTimeout(() => {
          navigate("/userInfo");
        }, 2000);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        if (error.code === "auth/code-expired") {
          toast.error("لقد إنتهت صلاحية رمز التأكيد", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
          return;
        }
        toast.error("! رمز تأكيد ليس صحيح", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
        // console.error(error);
      });
  };

  let count = 0;
  // submit otp
  useEffect(() => {
    if (confirmationResult.hasOwnProperty("verificationId") && count === 0) {
      count++;
      toast.success(`تم إرسال رمز التحقق إلى الرقم  ${getPhone()}`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
    }
  }, []);

  return (
    <div className="signup--container">
      <div className="otp">
        <h1>التحقق من رقمك</h1>
        <p className="d-f">
          <span>{getPhone()}</span>
          تم إرسال رمز التحقق إلى الرقم
        </p>
        <form onSubmit={handelSubmit}>
          <div className="otp-inputs">
            {otp.map((data, index) => {
              return (
                <input
                  itemType="number"
                  typeof="number"
                  type="tel"
                  pattern="\d*"
                  key={index}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  disabled={isOtpVerifie}
                  onFocus={(e) => e.target.select()}
                />
              );
            })}
          </div>
          {/* didnt get otp */}
          <p className="resend-otp">
            ليس رقمي ؟ <Link to="/signup"> تغيير رقمك </Link>
          </p>
          <div className="btns">
            <button className="btn otp-confiramtion" disabled={!isOtpVerifie}>
              تأكيد
            </button>
            <button
              className="btn otp-clear"
              onClick={clearOtp}
              disabled={!isOtpVerifie}
            >
              مسح
            </button>
          </div>
        </form>
        <ToastContainer
          position="top-center"
          autoClose={4000}
          limit={2}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
}
