import "./styles/userProfile.css";
import { BiArrowBack, BiCheck } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { RiInformationLine } from "react-icons/ri";
import { MdDelete, MdOutlineEmail, MdOutlineLocalPhone } from "react-icons/md";
import { HiPencil } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import Camera from "./svg/Camera";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app, storage } from "../config/firebase";
import { doc, updateDoc, getFirestore } from "firebase/firestore/lite";
import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../assets/img/default-avatar.svg";

export default function UserProfile() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  // set update profile
  const updateProfile = useUser((state) => state.updateProfile);

  const [file, setFile] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is name Arabic
  const [isNameArabic, setIsNameArabic] = useState(/[\u0600-\u06FF]/.test(user?.displayName));
  const [isStatusArabic, setIsStatusArabic] = useState(/[\u0600-\u06FF]/.test(user?.userStatus));

  // profile state
  const [profile, setProfile] = useState({
    displayName: user?.displayName || "",
    userStatus: user?.userStatus || "",
  });

  // displayName Ref
  const displayNameRef = useRef(null);
  // userStatus Ref
  const userStatusRef = useRef(null);

  // max displayName length
  const maxDisplayNameLength = 30;
  // max userStatus length
  const maxUserStatusLength = 50;

  // handel profile change
  const handelProfileChange = (e) => {
    const { name, value } = e.target;
    if(name === 'displayName' && value.length > 0){
      const isArabicName = /[\u0600-\u06FF]/.test(value);
      setIsNameArabic(isArabicName)
    }
    if(name === 'userStatus' && value.length > 0){
      const isArabicStatus = /[\u0600-\u06FF]/.test(value);
      setIsStatusArabic(isArabicStatus)
    }

    if (name === "displayName" && value.length > maxDisplayNameLength)
      return toast.error(`الحد الأقصى للإسم ${maxDisplayNameLength} حرف`);
    if (name === "userStatus" && value.length > maxUserStatusLength)
      return toast.error(`الحد الأقصى للحالة ${maxUserStatusLength} حرف`);

    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // is displayName edit
  const [isDisplayNameEdit, setIsDisplayNameEdit] = useState(false);
  // is userStatus edit
  const [isUserStatusEdit, setIsUserStatusEdit] = useState(false);

  // handle back
  const handelBack = () => {
    setIsProfileShow(false);
  };

  // update the photo img in firebase
  const uploadTheImageFile = (file) => {
    // unique image name
    const imageName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `profile/${imageName}`);
    setIsImageLoading(true);
    if (getCurrentUser()?.photoPath) {
      const oldRef = ref(storage, getCurrentUser().photoPath);
      // Delete the file
      deleteObject(oldRef)
        .then(() => {
          // File deleted successfully
          console.log("fill deleted successfully");
        })
        .catch((error) => {
          console.log(error.message);
          // Uh-oh, an error occurred!
        });
    }
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    }, 
    (error) => {
      console.log(error.message);
      // Handle unsuccessful uploads
    }, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        const fullPath = uploadTask.snapshot.ref.fullPath;
        updateUserInfo(downloadURL, fullPath);
      });
    });
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
    uploadTheImageFile(file);
  };

  // update the user info in firebase
  const updateUserInfo = (downloadURL, fullPath) => {
    const updatedFeild = {
      photoURL: downloadURL,
      photoPath: fullPath,
    };
    updateProfile(updatedFeild);
    const firestore = getFirestore(app);
    const userRef = doc(firestore, "users", getCurrentUser().uid);
    updateDoc(userRef,updatedFeild)
      .then(() => {
        toast.success("تم تحديث الصورة بنجاح");
        setIsImageLoading(false);
      })
      .catch((error) => {
        setIsImageLoading(false);
        console.error("Error updating document: ", error);
        toast.error("حدث خطأ أثناء تحديث الصورة رجاءا حاول مرة أخرى");
      });
  };

  // handel display name edit
  const handelDisplayNameEdit = () => {
    setIsDisplayNameEdit((prev) => !prev);
    if (isDisplayNameEdit && profile.displayName.trim() !== user?.displayName && profile.displayName !== '') {
      const firestore = getFirestore(app);
      const userRef = doc(firestore, "users", getCurrentUser().uid);
      updateDoc(userRef, {
        displayName: profile.displayName,
      })
        .then(() => {
          updateProfile({ displayName: profile.displayName });
          toast.success("تم تحديث الاسم بنجاح");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
          toast.error("حدث خطأ أثناء تحديث الاسم رجاءا حاول مرة أخرى");
        });
    } else {
      setTimeout(() => {
        displayNameRef.current.focus();
      }, 0);
    }
  };

  // handel user status edit
  const handelUserStatusEdit = () => {
    setIsUserStatusEdit((prev) => !prev);
    if (isUserStatusEdit && profile.userStatus.trim() !== user?.userStatus && profile.userStatus !== '') {
      const firestore = getFirestore(app);
      const userRef = doc(firestore, "users", getCurrentUser().uid);
      updateDoc(userRef, {
        userStatus: profile.userStatus,
      })
        .then(() => {
          updateProfile({ userStatus: profile.userStatus });
          toast.success("تم تحديث الحالة بنجاح");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
          toast.error("حدث خطأ أثناء تحديث الحالة رجاءا حاول مرة أخرى");
        });
    } else {
      setTimeout(() => {
        userStatusRef.current.focus();
      }, 0);
    }
  };

  return (
    <div className={`user-profile`}>
      <header className="user-profile--header">
        <div className="header--text">
          <BiArrowBack onClick={handelBack} className="r-180" />
          <h4>الملف الشخصي</h4>
        </div>
      </header>
      {/* profile imagae */}
      <div className="profile--image d-f">
        <div className="img">
          <img
            src={
              file
                ? URL.createObjectURL(file)
                : getCurrentUser()?.photoURL
                ? getCurrentUser().photoURL
                : defaultAvatar
            }
            alt="avatar"
          />
          {/* upload file */}
          <label
            htmlFor="file-input"
            className={`icon d-f ${isImageLoading ? "disabel" : ""}`}
          >
            <Camera />
          </label>
          <input
            onChange={handleFile}
            id="file-input"
            type="file"
            name="file"
            style={{ display: "none" }}
          />
          {/* <div className="deleteImg">
            <MdDelete />
          </div> */}
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* profile info */}
      <div className="profile--info">
        {/* profile name */}
        <div className="profile--name">
          <div className="icon">
            <CgProfile />
          </div>
          <div className="display">
            <h3>الإسم</h3>
            <div className="input">
              <input
                type="text"
                value={profile.displayName}
                name="displayName"
                onChange={handelProfileChange}
                className={isNameArabic ? "f-ar dr-ar" : "f-en dr-en"}
                disabled={!isDisplayNameEdit}
                ref={displayNameRef}
                onKeyDown={(e) => e.key === "Enter" && handelDisplayNameEdit()}
              />
              {isDisplayNameEdit && (
                <span className="length">{maxDisplayNameLength - profile.displayName.length}</span>
              )}
              <div className="edit" onClick={handelDisplayNameEdit}>
                {isDisplayNameEdit ? (
                  <BiCheck className="check" />
                ) : (
                  <HiPencil />
                )}
              </div>
            </div>
          </div>
          <div></div>
          <p className="info">
            هذا الاسم ليس كلمة مرور ولا رقم تعريف. إنما يكون هذا الاسم ظاهراً
            لجهات اتصالك في واتساب.
          </p>
        </div>
        {/* profile status */}
        <div className="profile--status">
          <div className="icon">
            <RiInformationLine />
          </div>
          <div className="display">
            <h3>الحالة</h3>
            <div className="input">
              <input
                disabled={!isUserStatusEdit}
                ref={userStatusRef}
                type="text"
                name="userStatus"
                value={profile.userStatus}
                onChange={handelProfileChange}
                className={isStatusArabic ? "f-ar dr-ar" : "f-en dr-en"}
                onKeyDown={(e) => e.key === "Enter" && handelUserStatusEdit()}
              />
              {isUserStatusEdit && (
                <span className="length">{maxUserStatusLength - profile.userStatus.length}</span>
              )}
              <div className="edit d-f" onClick={handelUserStatusEdit}>
                {isUserStatusEdit ? (
                  <BiCheck className="check" />
                ) : (
                  <HiPencil />
                )}
              </div>
            </div>
          </div>
        </div>
        {/* profile phone number */}
        {user?.phoneNumber && (
          <div className="profile--phone-number">
            <div className="icon">
              <MdOutlineLocalPhone />
            </div>
            <div className="display">
              <h3>رقم الهاتف</h3>
              <h4 className="dr-en">{user?.phoneNumber}</h4>
            </div>
          </div>
        )}
        {/* profile email */}
        {user?.email && (
          <div className="profile--phone-number">
            <div className="icon">
              <MdOutlineEmail />
            </div>
            <div className="display">
              <h3>البريد الإلكتروني</h3>
              <h4 className="dr-en">{user?.email}</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
