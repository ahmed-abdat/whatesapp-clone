import { useEffect, useRef, useState } from "react";
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
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
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

  // get isEmailUser
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

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
    if (phone.length >= 11) {
      setIsLoding(true);
      const isUserExiste = data.find((user) => user.phoneNumber === phone);
      if (isUserExiste) {
        setCurrentUser(isUserExiste);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        requestRecaptcha();
        sendOtp();
      }
    } else {
      toast.error("! أدخل رقم هاتف صحيح");
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
        toast.success("تم تسجيل الدخول بنجاح");
        setIsEmailUser(true);
      })
      .catch((error) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
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
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        toast.success("تم تسجيل الدخول بنجاح");
        getGoogleUser(user.uid);
      })
      .catch((error) => {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
        // Handle Errors here.
        const errorCode = error.code;
        console.error(error);
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  };

  useEffect(() => {
    if (getIsPhoneUserVerified() && getCurrentUser()) {
      setTimeout(() => {
        navigate("/user");
      }, 500);
    } else if (getIsEmailUser() && getCurrentUser()) {
      setTimeout(() => {
        navigate("/user");
      }, 500);
    } else {
      getPhoneUsers();
    }
  }, []);

  // on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // update the online statues 
        updateDoc(doc(db, "users", user.uid), {
          isOnline: true,
        }).catch((error) => {
          console.error("Error updating document: ", error.message);
        });
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // save the user in firestore

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
          countries={["MR", "MA", "TN", "DZ", "LY", "EG", "SD", "SA"]}
          labels={ar}
        />
        <button type="submit" className="btn" disabled={isLoading}>
          التالي
        </button>
      </form>
      <div id="sign-in-recaptcha"></div>
      <div className="or">أو</div>
      {/* signup from google */}
      <div className="signup-google dr-en" onClick={signInWithGoogle}>
        <img
          className="google-icon"
          src="https://img.icons8.com/color/24/000000/google-logo.png"
        />
        <p className="btn google-btn dr-ar"> تسجيل الدخول عن طريق Google</p>
      </div>
      {/* signup with facebook */}
      <div className="signup-facebook dr-en" onClick={signInWithFacebook}>
        <img
          className="facebook-icon"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Facebook_f_logo_%282021%29.svg/768px-Facebook_f_logo_%282021%29.svg.png?20210818083032"
        />
        <p className="btn facebook-btn dr-ar"> تسجيل الدخول عن طريق Facebook</p>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={2}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
