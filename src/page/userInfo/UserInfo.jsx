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
import { toast } from "sonner";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../config/firebase";
import Camera from "../../components/svg/Camera";
import Avatar from '../../assets/img/anonymous-user.jpg'
import { getAuth, updateProfile } from "firebase/auth";
import defaultAvatar from '../../assets/img/default-avatar.svg'
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { FiCamera, FiUser } from "react-icons/fi";


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
        : null,
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

    console.log(currentUsere, displayName, photoURL);
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


  return (
    <div className="userInfo dr-ar min-h-screen bg-gradient-to-br from-whatsapp-primary/10 to-whatsapp-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-arabic text-2xl font-bold text-gray-900">
            المعلومات الشخصية
          </CardTitle>
          <CardDescription className="font-arabic text-gray-600 leading-relaxed">
            الرجاء إدخال معلوماتك و تحديد صورتك الشخصية - الإسم إلزامي
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handelSubmit} className="space-y-6">
            {/* Profile image upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <ShadcnAvatar className="w-24 h-24 ring-4 ring-whatsapp-primary/20">
                  <AvatarImage
                    src={file ? URL.createObjectURL(file) : user?.photoURL || Avatar}
                    alt="صورة المستخدم"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-whatsapp-primary to-whatsapp-secondary text-white text-xl font-bold">
                    <FiUser className="w-8 h-8" />
                  </AvatarFallback>
                </ShadcnAvatar>

                {/* Camera button overlay */}
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className={cn(
                    "absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-lg border-2 border-white hover:bg-gray-50",
                    (isLoading || (precentage !== null && precentage <= 99)) && "opacity-50 pointer-events-none"
                  )}
                  disabled={isLoading || (precentage !== null && precentage <= 99)}
                >
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer flex items-center justify-center w-full h-full"
                  >
                    <FiCamera className="w-4 h-4 text-gray-700" />
                  </label>
                </Button>

                <input
                  onChange={handleFile}
                  id="file-input"
                  type="file"
                  name="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Upload progress */}
              {isLoading && precentage !== null && (
                <div className="w-full space-y-2">
                  <Progress value={precentage} className="h-2" />
                  <p className="text-sm text-center text-gray-500 font-arabic">
                    جاري تحميل الصورة... {Math.round(precentage)}%
                  </p>
                </div>
              )}
            </div>

            {/* User name input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-arabic text-right">
                إسم المستخدم *
              </Label>
              <Input
                type="text"
                placeholder="أدخل إسمك هنا"
                onBlur={handelBlur}
                id="name"
                name="displayName"
                onChange={handelDisplayName}
                value={displayName}
                className={cn(
                  "h-12",
                  isArabic ? "font-arabic text-right" : "text-left"
                )}
                required
              />
            </div>

            {/* Email input for email users */}
            {getIsEmailUser() && (
              <div className="space-y-2">
                <Label htmlFor="email" className="font-arabic text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  disabled={getIsEmailUser()}
                  name="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني هنا"
                  id="email"
                  onChange={handelChangeData}
                  value={formData.email}
                  className="h-12 font-arabic text-right bg-gray-50"
                />
              </div>
            )}

            {/* Phone number input */}
            {(getIsAnonymousUser() || !getIsEmailUser()) && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-arabic text-right">
                  رقم الهاتف
                </Label>
                <Input
                  type="text"
                  placeholder="أدخل رقم هاتفك هنا"
                  id="phoneNumber"
                  name="phoneNumber"
                  onChange={handelPhone}
                  value={phoneNumber}
                  disabled={!getIsAnonymousUser() && !getIsEmailUser()}
                  className={cn(
                    "h-12 font-arabic text-right",
                    (!getIsAnonymousUser() && !getIsEmailUser()) && "bg-gray-50"
                  )}
                />
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-12 bg-whatsapp-primary hover:bg-whatsapp-primary-dark font-arabic text-lg"
              disabled={isLoading || (precentage !== null && precentage <= 99)}
            >
              {isLoading ? "جاري الحفظ..." : "التالي"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
