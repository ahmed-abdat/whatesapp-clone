import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ar from "react-phone-number-input/locale/ar.json";
import { auth, db } from "../../config/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useSignUp from "../../store/useSignUp";
import useUser from "../../store/useUser";
import "./SignUp.css";

export default function SignUp() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoding] = useState(false);
  const [data, setData] = useState([]);

  // get curentUser
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setIsEmailUser = useUser((state) => state.setIsEmailUser);

  const navigate = useNavigate();

  const setPhones = useSignUp((state) => state.setPhones);

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const setconfirmationResult = useSignUp(
    (state) => state.setconfirmationResult
  );

  // recapter form
  const requestRecaptcha = () => {
    // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    window.recaptchaVerifier = new RecaptchaVerifier(
      "sign-in-recaptcha",
      {
        size: "normal",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // sendOtp();
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast.error("حاول مرة أخرى", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        },
      },
      auth
    );
  };
  // send otp to phone number
  const sendOtp = () => {
    console.log("send otp ");
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setconfirmationResult(confirmationResult);
        setPhones(phone);
        setIsEmailUser(false);
        setIsLoding(false);
        navigate("/otp");
      })
      .catch((error) => {
        setIsLoding(false);
        console.log(error.code);
        if(error.code === "auth/too-many-requests") {
          toast.error('! عذرا لقد قمت بالكثير من طلبات في وقت قصير حاول مرة أخرى في وقت لاحق', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
            return
        }
        toast.error("حدث خطأ أثناء إرسال الرسالة", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      });
  };

  // handel submit form
  const handelSumbit = (e) => {
    e.preventDefault();
    if (phone.length >= 11) {
      setIsLoding(true);
      const isUserExiste = data.find((user) => user.phoneNumber === phone);
      if (isUserExiste) {
        setCurrentUser(isUserExiste);
        toast.success("مرحبا بعودتك ", {
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
          navigate("/user");
        }, 2000);
      } else {
        requestRecaptcha();
        sendOtp();
      }
    }
  };

  // get the user that sign in with phone in firestore
  const getPhoneUsers = async () => {
    const q = query(collection(db, "users"), where("phoneNumber", "!=", null));
    const querySnapshot = await getDocs(q);
    let AllDocs = [];
    querySnapshot.forEach((doc) => {
      AllDocs.push({ id: doc.id, ...doc.data() });
    });
    setData(AllDocs);
  };

  // get the cuurent user that sign in with google
  const getGoogleUser = async (id) => {
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
        setTimeout(() => {
          navigate("/user");
        }, 2000);
      } else {
        navigate("/userInfo");
        console.log("No such document!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // sign up with google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        getGoogleUser(user.uid);
        setCurrentUser(user);
        toast.success("تم تسجيل الدخول بنجاح", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setIsEmailUser(true);
      })
      .catch((error) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
        // Handle Errors here.
        const errorCode = error.code;
        console.error(error);
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  };

  // sign up with facebook
  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setCurrentUser(user);
        toast.success("تم تسجيل الدخول بنجاح", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        getGoogleUser(user.uid);
      })
      .catch((error) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
        // Handle Errors here.
        const errorCode = error.code;
        console.error(error);
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    } else {
      getPhoneUsers();
    }
  }, []);

  // save the user in firestore

  return (
    <div className="signup--container">
      <div className="info">
        <h3>أدخل رقم هاتفك</h3>
        <p>سيحتاج واتساب إلى التحقق من رقم هاتفك.</p>
      </div>
      <form className="signup-form" onSubmit={handelSumbit}>
        <PhoneInput
          className={`phoneInput`}
          value={phone}
          onChange={setPhone}
          placeholder="رقم هاتفك هنا ..."
          defaultCountry="MR"
          international
          limitMaxLength
          countries={["MR", "MA", "TN", "DZ", "LY", "EG", "SD", "SA"]}
          labels={ar}
        />
        <button type="submit" className="btn" disabled={isLoading}>
          التالي
        </button>
      </form>
      <div id="sign-in-recaptcha"></div>
      {/* signup from google */}
      <div className="signup-google" onClick={signInWithGoogle}>
        <img
          className="google-icon"
          src="https://img.icons8.com/color/24/000000/google-logo.png"
        />
        <p className="btn google-btn"> Sign In with Google</p>
      </div>
      {/* signup with facebook */}
      <div className="signup-facebook" onClick={signInWithFacebook}>
        <img className="facebook-icon" src="/Facebook-logo.png" />
        <p className="btn facebook-btn"> Sign In with Facebook</p>
      </div>
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
  );
}
