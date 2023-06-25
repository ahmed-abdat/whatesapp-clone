import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import useUser from "../../store/useUser";
import { useState } from "react";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import { app } from "../../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../config/firebase";
import "react-toastify/dist/ReactToastify.css";
import Camera from "../../components/svg/Camera";
import { getAuth, updateProfile } from "firebase/auth";

export default function UserInfo() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  const setCurrentUser = useUser((state) => state.setCurrentUser);
  const getIsEmailUser = useUser((state) => state.getIsEmailUser);

  // get isAnonymousUser
  const getIsAnonymousUser = useUser((state) => state.getIsAnonymousUser);
  // const setIsAnonymousUser = useUser((state) => state.setIsAnonymousUser);
  // state
  const [file, setFile] = useState(null);

  // displayName user
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarName, setAvatarName] = useState(user?.displayName || "user");
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
      photoURL: downloadURL
        ? downloadURL
        : user?.photoURL
        ? user.photoURL
        : getAvatarURL(avatarName),
      imageFullPath: fullPath ? fullPath : null,
    };
    const required =
      getIsEmailUser() || getIsAnonymousUser()
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
      const phoneUseData = {
        displayName: user.displayName,
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        photoURL: user?.photoURL ? user.photoURL : null,
        isOnline: true,
        photoPath: user?.imageFullPath ? user.imageFullPath : null,
        lastSeen: serverTimestamp(),
        userStatus: "جديد في واتساب",
        lastMessage: "",
      };
      const emailUserData = {
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user?.phoneNumber ? user.phoneNumber : null,
        uid: user.uid,
        isOnline: true,
        photoURL: user?.photoURL ? user.photoURL : null,
        photoPath: user?.imageFullPath ? user.imageFullPath : null,
        lastSeen: serverTimestamp(),
        userStatus: "جديد في واتساب",
        lastMessage: "",
      };
      const auth = getAuth();
      const userData =
        getIsEmailUser() || getIsAnonymousUser() ? emailUserData : phoneUseData;
      const firestore = getFirestore(app);
      const docRef = doc(firestore, "users", user.uid);
      if (getIsAnonymousUser()) {
        updateGoogleProfile(
          auth.currentUser,
          userData.displayName,
          userData.photoURL
        );
      }
      await setDoc(docRef, userData);
      setCurrentUser(userData);
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

  // update user google profile
  const updateGoogleProfile = async (currentUsere, displayName, photoURL) => {
    try {
      await updateProfile(currentUsere, {
        displayName: displayName,
        photoURL: photoURL,
      });
      console.log("update succes");
    } catch (error) {
      console.log(error.message);
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

    if (file) {
      const required = getIsEmailUser()
        ? isUserEmailRequiredment()
        : isUserPhoneRequiredment();
      required && uploadTheImageFile();
      return;
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

  // handel blure input
  const handelBlur = (e) => {
    const { value } = e.target;
    if (value.length === 0) {
      setAvatarName("user");
      return;
    }
    setAvatarName(value);
  };

  // handel set avatar name
  const getAvatarURL = (name) => {
    return `https://avatars.dicebear.com/api/avataaars/${name}.svg`;
  };

  return (
    <div className="userInfo dr-ar">
      <form onSubmit={handelSubmit}>
        <div className="header">
          <h2> المعلومات الشخصية </h2>
          <p>الرجاء إدخال معلوماتك و تحديد صورتك الشخصية - الإسم إلزامي</p>
        </div>
        {/* upload image file */}
        <div className="d-f">
          <label htmlFor="file-input">
            <div className="img d-f">
              <img
                src={
                  file
                    ? URL.createObjectURL(file)
                    : user?.photoURL
                    ? user.photoURL
                    : `https://avatars.dicebear.com/api/avataaars/${avatarName}.svg`
                }
                alt="a user image"
              />
            </div>
            <label
              htmlFor="file-input"
              className={`camera d-f ${
                isLoading || (precentage !== null && precentage <= 99)
                  ? "disabel"
                  : ""
              }`}
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
          </label>
        </div>

        <div className="input name">
          <label htmlFor="name"> إسم المستخدم </label>
          <input
            type="text"
            placeholder="أدخل إسمك هنا"
            onBlur={handelBlur}
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
              type="email"
              placeholder="أدخل بريدك الإلكتروني هنا"
              id="email"
              onChange={handelChangeData}
              value={formData.email}
            />
          </div>
        )}
        {!getIsAnonymousUser() && (
          <div className="input phone">
            <label htmlFor="phoneNumber"> رقم الهاتف</label>
            <input
              type="text"
              placeholder="أدخل رقم هاتفك هنا"
              id="phoneNumber"
              name="phoneNumber"
              onChange={handelPhone}
              value={phoneNumber}
              disabled={getIsEmailUser() || getIsAnonymousUser() ? false : true}
            />
          </div>
        )}

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
