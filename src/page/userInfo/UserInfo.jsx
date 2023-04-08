import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import useUser from "../../store/useUser";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";;
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function UserInfo() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);

  // state
  const [formData, setFormData] = useState({
    email: user.email,
    displayName: user.displayName || "",
  });

  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');

  const [isLoading , setIsLoding] = useState(false)

  // navigate
  const navigate = useNavigate();

  // handelChangeData
  const handelChangeData = (e) => {
    const { value, name } = e.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  // update the user Data
  const updateUser = async (user) => {
    setIsLoding(true)
    try {
      const { displayName, email, uid, phoneNumber, photoURL } = user;
      const userData = {
        email,
        displayName,
        uid,
        phoneNumber,
        photoURL,
        isOnline: false,
      };
      await setDoc(doc(db, "users", uid), userData);
      setCurrentUser(userData)
      toast.success("تم تحديث البيانات ", { duration: 4000 });
      setTimeout(() => {
        navigate("/user");
        setIsLoding(false)
      }, 2500);
 
    } catch (error) {
      setIsLoding(false)
      console.error(error);
      toast.error("لم تتم العملية بنجاح حاول مرة أخرى");
    }
  };

  // handel Phone Number
  const handelPhone = (e) => {
    const { value } = e.target;
    if (/^[0-9]*$/.test(value) && value.length < 9) {
      setPhoneNumber(value);
    }
  };

  // handelSubmit
  const handelSubmit = async (e) => {
    e.preventDefault();
    const updatedUserData = { ...user, ...formData, phoneNumber };
    updateUser(updatedUserData)
  };

  

  // initialize the data

  return (
    <div className="userInfo dr-ar">
      <form onSubmit={handelSubmit}>
        <div className="header">
          <h2> المعلومات الشخصية </h2>
          <p>الرجاء إدخال معلوماتك و تحديد صورتك الشخصية - الإسم إلزامي</p>
        </div>
        <label htmlFor="file-input">
          <div className="img d-f">
            <img
              src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              alt="a user image"
            />
          </div>
        </label>
        <input
          id="file-input"
          type="file"
          name=""
          style={{ display: "none" }}
        />

        <div className="input name">
          <label htmlFor="name"> إسم المستخدم </label>
          <input
            type="text"
            placeholder="أدخل إسمك هنا"
            id="name"
            name="displayName"
            onChange={handelChangeData}
            value={formData.displayName}
          />
        </div>
        <div className="input phone">
          <label htmlFor="email"> البريد الإلكتروني </label>
          <input
            disabled={formData.email ? true : false}
            name="email"
            type="text"
            placeholder="أدخل بريدك الإلكتروني هنا"
            id="email"
            onChange={handelChangeData}
            value={formData.email}
          />
        </div>
        <div className="input phone">
          <label htmlFor="phoneNumber"> رقم الهاتف</label>
          <input
            type="text"
            placeholder="أدخل رقم هاتفك هنا"
            id="phoneNumber"
            name="phoneNumber"
            onChange={handelPhone}
            value={phoneNumber}
          />
        </div>
        <Toaster />
        <div className="btnes">
          <button
            type="button"
            className="cancel"
            onClick={handelSubmit}
            disabled={isLoading}
          >
            تخطي
          </button>
          <button className="send" disabled={isLoading}> تحديث البيانات </button>
        </div>
        {/* {connection ? (
            ""
          ) : (
            <p className="offline"> عذرا يبدو بأنك غير متصل بالإنترنت </p>
          )} */}
      </form>
    </div>
  );
}
