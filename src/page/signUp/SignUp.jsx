import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
// import "react-phone-number-input/style.css"; // Removed - using Tailwind CSS only
import ar from "react-phone-number-input/locale/ar.json";
import { app, auth } from "../../config/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore/lite";
import { useNavigate } from "react-router-dom";
import useSignUp from "../../store/useSignUp";
import useUser from "../../store/useUser";
import GestIcon from '../../assets/img/anonymous-user.jpg'
import GoogleIcon from '../../assets/img/google-logo.png'
import { toast } from 'sonner';
// import './SignUp.css' // Removed - using Tailwind CSS only


export default function SignUp() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoding] = useState(false);


  // get curentUser
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  const setIsEmailUser = useUser((state) => state.setIsEmailUser);

  // get isEmailUser
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // set isAnonymousUser
  const setIsAnonymousUser = useUser((state) => state.setIsAnonymousUser);
  const getIsAnonymousUser = useUser((state) => state.getIsAnonymousUser);

  // get phoneUserVerified
  const getIsPhoneUserVerified = useUser(
    (state) => state.getIsPhoneUserVerified
  );

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
          toast.error("حاول مرة أخرى");
        },
      },
      auth
    );
  };
  // send otp to phone number
  const sendOtp = () => {
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
        if (error.code === "auth/too-many-requests") {
          toast.error(
            "! عذرا لقد قمت بالكثير من طلبات في وقت قصير حاول مرة أخرى في وقت لاحق"
          );
          return;
        }
        toast.error("حدث خطأ أثناء إرسال الرسالة");
      });
  };

  // handel submit form
  const handelSumbit = (e) => {
    e.preventDefault();
    if (phone.length >= 12) {
      setIsLoding(true);
        requestRecaptcha();
        sendOtp();
    } else {
      toast.error("! أدخل رقم هاتف صحيح");
    }
  };

  // get the cuurent user that sign in with google
  const getGoogleUser = async (id) => {
    try {
      const firestore = getFirestore(app)
      const docRef = doc(firestore, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIsLoding(false)
        updateIsOnline(docSnap.id)
        setCurrentUser(docSnap.data());
         setTimeout(() => {
          navigate("/");
         }, 1500);
      } else {
        navigate("/userInfo");
        console.log("No such document!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // update user isOnline to true
  const updateIsOnline = async (id) => {
    try {
      const firestore = getFirestore(app)
     const docRef = doc(firestore, "users", id);
     await updateDoc(docRef, {
       isOnline: true,
       lastSeen :  serverTimestamp()
     })
    } catch (error) {
     console.error(error.message);
    }
   }

  // sign up with google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    setIsLoding(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        getGoogleUser(user.uid);
        toast.success("تم تسجيل الدخول بنجاح");
        setIsEmailUser(true);
      })
      .catch((e) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        console.error(e.message);
        setIsLoding(false);
      });
  };



  // on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if ((getCurrentUser() && getIsPhoneUserVerified()) || (getCurrentUser() && getIsEmailUser())) {
        navigate("/");
      } else if(user){
        setCurrentUser(user);
      }else {
        setCurrentUser(null);
      }
    });
    return ()=> unsubscribe();
  }, []);

  // sign up anonymous user
  const signUpAnonymous = () => {
    setIsLoding(true)
    signInAnonymously(auth).then((userCredential) => {
      setIsAnonymousUser(true)
      setIsEmailUser(false)
      const user = userCredential.user;
      setCurrentUser(user)
      setIsLoding(false)
      navigate("/userInfo");
    }).catch((error) => {
      cosole.error(error.message);
    });
  };

// clear the localsotrage
useEffect(() => {
  if(getIsAnonymousUser()){
    setCurrentUser(null)
    localStorage.clear()
  }
}, [])

  return (
    <div className="signup--container">
      <div className="info">
        <h3>أدخل رقم هاتفك</h3>
        <p>سيحتاج واتساب إلى التحقق من رقم هاتفك.</p>
      </div>
      <form className="signup-form dr-en" onSubmit={handelSumbit}>
        <PhoneInput
          className={`phoneInput`}
          value={phone}
          onChange={setPhone}
          placeholder="رقم هاتفك هنا ..."
          defaultCountry="MR"
          international
          limitMaxLength
          labels={ar}
        />
        <button type="submit" className="btn" disabled={isLoading}>
          التالي
        </button>
      </form>
      <div className="dr-en">
      <div id="sign-in-recaptcha"></div>
      </div>
      <div className="or">أو</div>
      {/* signup from google */}
      <div className={`signup-google dr-en ${isLoading ? 'disabel-no-opacity' : ''}`} onClick={signInWithGoogle}>
        <img
          className="google-icon"
          src={GoogleIcon}
        />
        <p className="btn google-btn dr-ar"> تسجيل الدخول عن طريق Google</p>
      </div>
      <div className={`signup-google geust dr-en ${isLoading ? 'disabel-no-opacity' : ''}`} onClick={signUpAnonymous}>
        <img
          className="google-icon"
          src={GestIcon} alt="gest icon"
        />
        <p className="btn google-btn dr-ar"> تسجيل الدخول كضيف  </p>
      </div>
    </div>
  );
}
