import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import useUser from "../../store/useUser";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../config/firebase";

import "react-toastify/dist/ReactToastify.css";

export default function UserInfo() {
    // get current user
    const getCurrentUser = useUser((state) => state.getCurrentUser);
    const user = getCurrentUser();
  
    const setCurrentUser = useUser((state) => state.setCurrentUser);
    const getIsEmailUser = useUser((state) => state.getIsEmailUser);


  // state
  const [allUsers, setAllUsers] = useState([]);
  const [file, setFile] = useState( null);

  // 


  const [formData, setFormData] = useState({
    email: getIsEmailUser() ? user.email : "",
    displayName: user.displayName || "",
    photoURL : user.photoURL
  });
  const [phoneNumber, setPhoneNumber] = useState(
    getIsEmailUser() ? "" : user.phoneNumber
  );

  const [precentage , setPercentege] = useState(null)

useEffect(()=> {
  if(file){
    // update the user image
    uploadTheImageFile()
  }
},[file])

// update the photo img in firebase 
const uploadTheImageFile = ()=> {
  const storageRef = ref(storage, file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on('state_changed', 
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    setPercentege(progress)
    switch (snapshot.state) {
      case 'paused':
        // console.log('Upload is paused');
        break;
      case 'running':
        // console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    console.error(error)
  }, 
  () => {
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      setFormData((prevData) => {
        return {
          ...prevData,
          photoURL : downloadURL
        }
      })
    });
  }
);
}


  const [isLoading, setIsLoding] = useState(false);

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
    setIsLoding(true);

    try {
      const { displayName, email, uid, phoneNumber, photoURL } = user;
      const userData = {
        email: email ? email : null,
        displayName,
        uid,
        phoneNumber: phoneNumber ? phoneNumber : null,
        photoURL: photoURL ? photoURL : null,
        isOnline: false,
      };
      await setDoc(doc(db, "users", uid), userData);
      setCurrentUser(userData);
      toast.success("تم تحديث البيانات ", {
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
        setIsLoding(false);
      }, 2000);
    } catch (error) {
      setIsLoding(false);
      console.error(error);
      toast.error("لم تتم العملية بنجاح حاول مرة أخرى", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
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
      toast.warn('رجاءا قم بإخيار صورة صالحة', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        isLoading: false,
        });
      return;
    }
    setFile(file);
  };

  // handelSubmit
  const handelSubmit = async (e) => {
    e.preventDefault();
    const valid = getIsEmailUser()
      ? isValideNumber(phoneNumber)
      : isValideEmail(formData.email);

    if (valid) {
      if(formData.displayName.length >= 2 ){
        const updatedUserData = { ...user, ...formData, phoneNumber , file };
        updateUser(updatedUserData);
      }else {
        toast.error("الإسم يجب أن يكون أكثر من حرفين", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      }
    }
  };

  // get all user from firebase
  const getAllUsers = async () => {
    const users = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id });
    });
    setAllUsers(users);
  };

  // is valide number
  const isValideNumber = (number) => {
    const validNumver = allUsers.find((user) => user.phoneNumber === number);
    if (validNumver) {
      toast.error("رقم الهاتف مستخدم من قبل", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
      return false;
    }
    return true;
  };

  // is valide email
  const isValideEmail = (email) => {
    const validEmail = allUsers.find((user) => user.email === email);
    if (validEmail) {
      toast.error("البريد الإلكتروني مستخدم من قبل", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
      return false;
    }
    return true;
  };

  useEffect(() => {
    getAllUsers();
  }, []);

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
              src={ file ? URL.createObjectURL(file) : formData.photoURL ? formData.photoURL : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
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
        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={2}
        />
        <div className="btnes">
          <button
            type="button"
            className="cancel"
            onClick={handelSubmit}
            disabled={isLoading || (precentage !== null && precentage <= 99)}
          >
            تخطي
          </button>
          <button className="send dr-ar" disabled={isLoading || (precentage !== null && precentage <= 99)}>
           {isLoading ? "...جاري تحديث البيانات": " تحديث البيانات"}
          </button>
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
