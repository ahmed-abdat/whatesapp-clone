import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import useUser from "../../store/useUser";
import { useEffect, useState } from "react";
import {  getFirestore, doc, setDoc  } from "firebase/firestore/lite";
import {app} from '../../config/firebase'
import { ToastContainer, toast } from "react-toastify";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../config/firebase";
import DefaultAvatar from '../../assets/img/default-avatar.svg'

import "react-toastify/dist/ReactToastify.css";

export default function UserInfo() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // state
  const [file, setFile] = useState(null);

  // displayName user
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  // is name Arabic
  const [isArabic, setIsArabic] = useState(false);

  const [formData, setFormData] = useState({
    email: getIsEmailUser() ? user?.email : "",
    photoURL: user?.photoURL,
  });

  const [phoneNumber, setPhoneNumber] = useState(
    getIsEmailUser() ? "" : user?.phoneNumber
  );

  const [precentage, setPercentege] = useState(null);

  const [isLoading, setIsLoding] = useState(false);

  // navigate
  const navigate = useNavigate();

  // set phoneuserVerified
  const setIsPhoneUserVerified = useUser(
    (state) => state.setIsPhoneUserVerified
  );

  // get phoneuserVerified
  const getIsPhoneUserVerified = useUser(
    (state) => state.getIsPhoneUserVerified
  );

  // update the photo img in firebase
  const uploadTheImageFile = () => {
    // unique image name
    const imageName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `profile/${imageName}`);
    if (getCurrentUser().photoPath) {
      const oldRef = ref(storage, getCurrentUser().photoPath);
      // Delete the file
      deleteObject(oldRef)
        .then(() => {
          console.log("fill deleted successfully");
          // File deleted successfully
        })
        .catch((error) => {
          console.log("error deleting ");
          // Uh-oh, an error occurred!
        });
    }
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setIsLoding(true);
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentege(progress);
      },
      (error) => {
        console.error(error);
        toast.error("حدث خطأ أثناء تحميل الصورة رجاءا حاول مرة أخرى");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prevData) => {
            return {
              ...prevData,
              photoURL: downloadURL,
            };
          });
          const fullPath = uploadTask.snapshot.ref.fullPath;
          handelUploadUserInfo(downloadURL, fullPath);
        });
      }
    );
  };

  // handelUploadUserInfo
  const handelUploadUserInfo = (downloadURL, fullPath) => {
    const updatedUserData = {
      ...user,
      ...formData,
      displayName,
      phoneNumber,
      photoURL: downloadURL ? downloadURL : user.photoURL,
      imageFullPath: fullPath,
    };
    const required = getIsEmailUser()
      ? isUserEmailRequiredment()
      : isUserPhoneRequiredment();
    required && updateUser(updatedUserData);
  };

  // handelChangeData
  const handelChangeData = (e) => {
     // is name Arabic
  const isArabic = /[\u0600-\u06FF]/.test(user?.displayName);
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
    setIsLoding(true);
    try {
      const {
        displayName,
        email,
        uid,
        phoneNumber,
        photoURL,
        imageFullPath,
      } = user;
      const phoneUseData = {
        displayName,
        uid,
        phoneNumber,
        photoURL: photoURL ? photoURL : null,
        isOnline: true,
        photoPath: imageFullPath ? imageFullPath : null,
        lastSeen: new Date().getTime(),
        userStatus : 'جديد في واتساب',
        lastMessage : ''
      };
      const emailUserData = {
        email,
        displayName,
        phoneNumber: phoneNumber ? phoneNumber : null,
        uid,
        isOnline: true,
        photoURL: photoURL ? photoURL : null,
        photoPath: imageFullPath ? imageFullPath : null,
        lastSeen: new Date().getTime(),
        userStatus : 'جديد في واتساب',
        lastMessage : ''
      };

      
      const userData = getIsEmailUser() ? emailUserData : phoneUseData;
      const firestore = getFirestore(app);
      const docRef = doc(firestore, 'users', uid);
      await setDoc(docRef, userData);

      setCurrentUser(userData);
      setIsPhoneUserVerified(true);
      toast.success("تم تحديث الملف الشخصي ");
      setTimeout(() => {
        navigate("/");
        setIsLoding(false);
      }, 2500);
    } catch (error) {
      setIsLoding(false);
      console.error(error.message);
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
  // handel file
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Check if the file type is an image
    if (!file.type.startsWith("image/")) {
      toast.warn("رجاءا قم بإخيار صورة صالحة");
      return;
    }
    setFile(file);
  };

  // handelSubmit
  const handelSubmit = async (e) => {
    e.preventDefault();

    if ( file) {
      const required = getIsEmailUser()
        ? isUserEmailRequiredment()
        : isUserPhoneRequiredment();
      required && uploadTheImageFile();
      return
    } 
      handelUploadUserInfo();
    
  };

  // handel validate user phone
  const isUserPhoneRequiredment = () => {
    if (displayName.length >= 2) {
      return true;
    } 
      toast.error("الإسم يجب أن يكون أكثر من حرفين");
      return false;
    
  };

  // handel validate user email
  const isUserEmailRequiredment = () => {
    if (displayName.length >= 2) {
      return true;
    }
    toast.error("الإسم يجب أن يكون أكثر من حرفين");
    return false;
  };

  // handel displayName user
  const handelDisplayName = (e) => {
    const { value } = e.target;
    const isArabic = /[\u0600-\u06FF]/.test(value);
    if (isArabic) {
      setIsArabic(true);
    } else {
      setIsArabic(false);
    }
    setDisplayName(value);
  };





  useEffect(() => {
    if (!getIsEmailUser() && !getIsPhoneUserVerified()) {
      toast.warning("الرجاء ضغض على التالي للمتابعة");
      navigate("/signUp");
    } 
  }, []);

  return (
    <div className="userInfo dr-ar">
      <form onSubmit={handelSubmit}>
        <div className="header">
          <h2> المعلومات الشخصية </h2>
          <p>الرجاء إدخال معلوماتك و تحديد صورتك الشخصية - الإسم إلزامي</p>
        </div>
        {/* upload image file */}
        <div className="d-f">
          <label htmlFor="file-input" style={{ borderRadius: "50%" }}>
            <div className="img d-f">
              <img
                src={
                  file
                    ? URL.createObjectURL(file)
                    : user?.photoURL
                    ? user.photoURL
                    : DefaultAvatar
                }
                alt="a user image"
              />
            </div>
          </label>
          <input
            onChange={handleFile}
            id="file-input"
            type="file"
            name="file"
            style={{ display: "none" }}
          />
        </div>

        <div className="input name">
          <label htmlFor="name"> إسم المستخدم </label>
          <input
            type="text"
            placeholder="أدخل إسمك هنا"
            id="name"
            name="displayName"
            onChange={handelDisplayName}
            value={displayName}
            className={isArabic ? "f-ar" : "f-en"}
          />
        </div>
        {getIsEmailUser() && (
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
        )}
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
        {/* password for user phone */}
        {/* {!getIsEmailUser() && (
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
        )} */}
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
          theme="light"
          limit={2}
        />
        <div className="btnes">
          <button
            className="send btn-p"
            disabled={isLoading || (precentage !== null && precentage <= 99)}
          >
            التالي
          </button>
        </div>
      </form>
    </div>
  );
}
