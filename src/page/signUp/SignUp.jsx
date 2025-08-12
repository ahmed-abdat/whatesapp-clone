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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center w-full">
      <div className="mb-4 dr-ar font-vazir">
        <h3 className="text-xl text-center mb-4 font-medium text-whatsapp-primary-darker">أدخل رقم هاتفك</h3>
        <p className="text-base text-text-color">سيحتاج واتساب إلى التحقق من رقم هاتفك.</p>
      </div>
      <form className="px-4 py-2 flex flex-col gap-5 dr-en" onSubmit={handelSumbit}>
        <PhoneInput
          className="shadow-sm border border-whatsapp-primary/20 px-2 py-1 rounded-sm focus-within:shadow-whatsapp-primary/40 [&_input]:bg-transparent [&_input]:border-none [&_input]:px-4 [&_input]:py-2 [&_input]:w-full [&_input]:h-full [&_input]:outline-none [&_input]:text-base [&>*:not(input)_*_*]:text-base [&>*:not(input)_*_*]:font-vazir"
          value={phone}
          onChange={setPhone}
          placeholder="رقم هاتفك هنا ..."
          defaultCountry="MR"
          international
          limitMaxLength
          labels={ar}
        />
        <button 
          type="submit" 
          className="shadow-whatsapp-primary/40 shadow-lg rounded-sm font-vazir self-center w-25 px-2 py-2 text-sm text-gray-100 bg-whatsapp-primary hover:bg-whatsapp-primary-dark hover:shadow-whatsapp-primary-dark/40 transition-all duration-300 disabled:opacity-50" 
          disabled={isLoading}
        >
          التالي
        </button>
      </form>
      <div className="dr-en">
        <div id="sign-in-recaptcha"></div>
      </div>
      
      {/* OR divider */}
      <div className="mt-3 text-base font-medium font-vazir relative">
        <span className="bg-gray-100 px-2">أو</span>
        <div className="absolute inset-0 flex items-center">
          <div className="w-32 h-px bg-black/50 mr-5"></div>
          <div className="w-32 h-px bg-black/50 ml-5"></div>
        </div>
      </div>
      
      {/* Google sign in */}
      <div className={`shadow-md flex items-center justify-between bg-white text-black/55 px-1 w-72 mt-6 cursor-pointer overflow-hidden rounded-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg dr-en ${isLoading ? 'disabel-no-opacity' : ''}`} onClick={signInWithGoogle}>
        <img
          className="bg-transparent px-1 w-9"
          src={GoogleIcon}
          alt="Google icon"
        />
        <p className="font-vazir font-medium text-base text-inherit mr-4 dr-ar">تسجيل الدخول عن طريق Google</p>
      </div>
      
      {/* Guest sign in */}
      <div className={`shadow-md flex items-center justify-between bg-white text-black/55 px-1 w-72 mt-3 cursor-pointer overflow-hidden rounded-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg dr-en ${isLoading ? 'disabel-no-opacity' : ''}`} onClick={signUpAnonymous}>
        <img
          className="bg-transparent px-1 w-9"
          src={GestIcon} 
          alt="Guest icon"
        />
        <p className="font-vazir font-medium text-base text-inherit mr-4 dr-ar">تسجيل الدخول كضيف</p>
      </div>
    </div>
  );
}
