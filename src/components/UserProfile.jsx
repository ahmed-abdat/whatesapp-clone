import "./styles/userProfile.css";
import { BiArrowBack } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { RiInformationLine } from "react-icons/ri";
import { MdOutlineLocalPhone } from "react-icons/md";
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
import { doc, updateDoc , getFirestore} from "firebase/firestore/lite";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserProfile() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const [file, setFile] = useState(null);

  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is profile show
  const isProfileShow = useUsers((state) => state.isProfileShow);

  // is name Arabic
  const isArabic = /[\u0600-\u06FF]/.test(user?.displayName);

  // handle back
  const handelBack = () => {
    setIsProfileShow(false);
  };

  // update the photo img in firebase
  const uploadTheImageFile = (file) => {
    // unique image name
    const imageName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `profile/${imageName}`);
    if (getCurrentUser().photoPath) {
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
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.error(error);
        toast.error("حدث خطأ أثناء تحميل الصورة رجاءا حاول مرة أخرى");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const fullPath = uploadTask.snapshot.ref.fullPath;
          updateUserInfo(downloadURL, fullPath);
        });
      }
    );
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
    const firestore = getFirestore(app);
    const userRef = doc(firestore , "users", getCurrentUser().uid);
    updateDoc(userRef, {
      photoURL: downloadURL,
      photoPath: fullPath,
    })
      .then(() => {
        toast.success("تم تحديث الصورة بنجاح")
        setFile(null);
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        toast.error("حدث خطأ أثناء تحديث الصورة رجاءا حاول مرة أخرى");
      });
  };

  return (
    <div className={`user-profile ${isProfileShow ? "profile-show" : ""}`}>
      
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
                : user?.photoURL
                ? user.photoURL
                : "/default-avatar.svg"
            }
            alt="avatar"
          />
          {/* upload file */}
          <label
            htmlFor="file-input"
            className={`icon d-f ${file ? "disabel" : ""}`}
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
            <h4 className={isArabic ? "f-ar" : "f-en"}>{user?.displayName}</h4>
          </div>
          <div className="edit">
            <HiPencil />
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
            <h4>مالايدرك كله لايترك جله</h4>
          </div>
          <div className="edit">
            <HiPencil />
          </div>
        </div>
        {/* profile phone number */}
        <div className="profile--phone-number">
          <div className="icon">
            <MdOutlineLocalPhone />
          </div>
          {
            user?.phoneNumber ? (
              <div className="display">
                <h3>رقم الهاتف</h3>
                <h4 className="dr-en">{user?.phoneNumber}</h4>
              </div>
            ) : (
              <div className="display">
                <h3>الإيميل</h3>
                <h4>{user?.email}</h4>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
