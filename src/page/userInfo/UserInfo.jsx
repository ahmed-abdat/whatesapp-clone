import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import useUser from "../../store/useUser";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";;
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { isValidPhoneNumber } from "react-phone-number-input";

export default function UserInfo() {

  // all Users
  const [allUsers, setAllUsers] = useState([]); 

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();



  const setCurrentUser = useUser((state) => state.setCurrentUser);
  const getIsEmailUser = useUser(state => state.getIsEmailUser)


  // state
  const [formData, setFormData] = useState({
    email: getIsEmailUser() ? user.email : '',
    displayName: user.displayName || "",
  });


  const [phoneNumber, setPhoneNumber] = useState(getIsEmailUser() ? '' : user.phoneNumber);

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
        email : email ? email : null,
        displayName,
        uid,
        phoneNumber : phoneNumber ? phoneNumber : null,
        photoURL :  photoURL ? photoURL : null,
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
    const valid = getIsEmailUser() ? isValideNumber(phoneNumber) : isValideEmail(formData.email)

    if(formData.displayName.length >= 2 && valid){
      const updatedUserData = { ...user, ...formData, phoneNumber };
      updateUser(updatedUserData)
    }else {
      toast.error("الإسم يجب أن يكون أكثر من حرفين", { duration: 4000 });
    }
  };

  // get all user from firebase
  const getAllUsers = async () => {
    const users = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      users.push({...doc.data() , id : doc.id});
    });
    setAllUsers(users)
  };

  // is valide number 
  const isValideNumber = (number) => {
    const validNumver = allUsers.find(user => user.phoneNumber === number)
    if(validNumver){
      toast.error("رقم الهاتف مستخدم من قبل", { duration: 4000 });
      return false
    }
    return true
  }

  // is valide email
  const isValideEmail = (email) => {
    const validEmail = allUsers.find(user => user.email === email)
    if(validEmail){
      toast.error("البريد الإلكتروني مستخدم من قبل", { duration: 4000 });
      return false
    }
    return true
  }

  useEffect(()=> {
   getAllUsers()
  },[])

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
            disabled={getIsEmailUser() ? true : false}
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
            disabled={getIsEmailUser() ? false : true}
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
