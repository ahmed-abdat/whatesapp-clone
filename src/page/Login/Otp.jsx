import { useEffect, useRef, useState } from "react";
import "./styles/Opt.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Otp({ confirmationResults }) {
  const firstInput = useRef(null);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpVerifie, setIsotpVerifie] = useState(false);

  const navigate = useNavigate();

  const handelChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    // if the last input is filled blur and disable the input
    if (index === otp.length - 1) {
      element.blur();
      setIsotpVerifie(true);
      return;
    }
    // otherwise focus the next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // clear OTP
  const clearOtp = () => {
    setOtp(new Array(6).fill(""));
    setIsotpVerifie(false);
  };

  const handelSubmit = (e) => {
    e.preventDefault();
    confirmationResults
      .confirm(otp.join(""))
      .then((result) => {
        toast.success("تمت المصادقة");
        // setUser(result.user);
        navigate("/");
        // console.log(result.user);
        // ...
      })
      .catch((error) => {
        toast.error("رمز تأكيد ليس صحيح!");
        console.error(error);
      });
  };

  // focus the first input when the component is mounted
  useEffect(() => {
    firstInput.current.focus();
  }, [isOtpVerifie]);

  return (
    <div className="otp">
      <h1>التحقق من رقمك</h1>
      <p className="d-f">
        <span>+222 37928327</span>
        تم إرسال رمز التحقق إلى الرقم
      </p>
      <form onSubmit={handelSubmit}>
        <div className="otp-inputs">
          {otp.map((data, index) => {
            return (
              <input
                ref={index === 0 ? firstInput : null}
                type="text"
                key={index}
                value={data}
                onChange={(e) => handelChange(e.target, index)}
                disabled={isOtpVerifie}
                onFocus={(e) => e.target.select()}
              />
            );
          })}
        </div>
        {/* didnt get otp */}
        <p className="resend-otp">
          لم تصلك رسالة؟ <a href="">إعادة الإرسال</a>
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
      <Toaster />
    </div>
  );
}
