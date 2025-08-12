import {
  ArrowRight,
  Check,
  UserRound,
  Info,
  LogOut,
  Trash2,
  Mail,
  Phone,
  Pencil,
} from "lucide-react";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import Camera from "./svg/Camera";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "../lib/utils";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app, auth, storage } from "../config/firebase";
import { FcGoogle } from "react-icons/fc";
import {
  doc,
  updateDoc,
  getFirestore,
  deleteDoc,
  getDocs,
  serverTimestamp,
  collection,
  query,
  deleteField,
  writeBatch,
} from "firebase/firestore/lite";
import { useRef, useState } from "react";
import { toast } from "sonner";
import defaultAvatar from "../assets/img/default-avatar.svg";
import ViewImage from "./ViewImage";
import DeleteModule from "./DeleteModule";
// import "./styles/userProfile.css"; // Removed - using Tailwind CSS only
import {
  GoogleAuthProvider,
  deleteUser,
  linkWithPopup,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import useSelectedUser from "../store/useSelectedUser";

export default function UserProfile() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);
  const user = getCurrentUser();

  // set update profile
  const updateProfile = useUser((state) => state.updateProfile);

  const [file, setFile] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageView, setIsImageView] = useState(false);
  const [isModuleshow, setIsModuleShow] = useState(false);

  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is name Arabic
  const [isNameArabic, setIsNameArabic] = useState(
    /[\u0600-\u06FF]/.test(user?.displayName)
  );
  const [isStatusArabic, setIsStatusArabic] = useState(
    /[\u0600-\u06FF]/.test(user?.userStatus)
  );

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
  const maxDisplayNameLength = 25;
  // max userStatus length
  const maxUserStatusLength = 50;

  // handel profile change
  const handelProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "displayName" && value.length > 0) {
      const isArabicName = /[\u0600-\u06FF]/.test(value);
      setIsNameArabic(isArabicName);
    }
    if (name === "userStatus" && value.length > 0) {
      const isArabicStatus = /[\u0600-\u06FF]/.test(value);
      setIsStatusArabic(isArabicStatus);
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

  // get isAnonymousUser
  const getIsAnonymousUser = useUser((state) => state.getIsAnonymousUser);
  const setIsAnonymousUser = useUser((state) => state.setIsAnonymousUser);
  const [isAnonymousUsere, setIsAnonymousUsere] = useState(
    getIsAnonymousUser()
  );
  // setIsLogoutLoading
  const setIsLogoutLoading = useUser((state) => state.setIsLogoutLoading);
  // set current user
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const navigate = useNavigate();

  // firestore
  const firestore = getFirestore(app);

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
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error.message);
        // Handle unsuccessful uploads
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
    const updatedFeild = {
      photoURL: downloadURL,
      photoPath: fullPath,
    };
    updateProfile(updatedFeild);
    const userRef = doc(firestore, "users", getCurrentUser().uid);
    updateDoc(userRef, updatedFeild)
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
    if (
      isDisplayNameEdit &&
      profile.displayName.trim() !== user?.displayName &&
      profile.displayName !== ""
    ) {
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
    if (
      isUserStatusEdit &&
      profile.userStatus.trim() !== user?.userStatus &&
      profile.userStatus !== ""
    ) {
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

  // handel delete user img
  const handelDeleteUserImg = async () => {
    setIsImageLoading(true);
    if (!getCurrentUser().photoPath) {
      updateProfile({ photoPath: null, photoURL: null });
      setFile(null);
      const userRef = doc(firestore, "users", getCurrentUser().uid);
      await updateDoc(userRef, {
        photoPath: null,
        photoURL: null,
      });
      setIsImageLoading(false);
      return;
    }
    const oldRef = ref(storage, getCurrentUser().photoPath);
    try {
      setIsImageLoading(true);
      await deleteObject(oldRef);
      console.log("fill deleted successfully");
      const userRef = doc(firestore, "users", getCurrentUser().uid);
      await updateDoc(userRef, {
        photoPath: null,
        photoURL: null,
      });
      updateProfile({ photoPath: null, photoURL: null });
      setFile(null);
      toast.success("تم حذف الصورة بنجاح");
      setIsImageLoading(false);
      setTimeout(() => {
        setIsImageView(false);
      }, 3000);
    } catch (error) {
      setIsImageLoading(false);
      console.error("Error updating document: ", error);
      toast.error("حدث خطأ أثناء تحديث الحالة رجاءا حاول مرة أخرى");
    }
  };

  // handel view image
  const handelViewImage = () => {
    if (file || getCurrentUser().photoURL) {
      setIsImageView(true);
    }
  };

  // link geust account to google account
  const linkToGoogle = async () => {
    const provider = new GoogleAuthProvider();
    linkWithPopup(auth.currentUser, provider)
      .then((result) => {
        updateEmail(result.user.uid, result.user.email);
        setIsAnonymousUsere(false);
        setIsAnonymousUser(false);
        toast.success("تم ربط حسابك بنجاح ");
        updateProfile({ email: result.user.email });
      })
      .catch((error) => {
        if (
          error.message === "Firebase: Error (auth/credential-already-in-use)."
        ) {
          toast.error("عذرا هذا الإيميل مربوط بحساب آخر  !");
          return;
        }
        console.error(error.message);
        toast.error("لم تتم العملية بنجاح حاول مرة أخرى");
      });
  };

  // update email user
  const updateEmail = async (id, email) => {
    try {
      const userDoc = doc(firestore, "users", id);
      await updateDoc(userDoc, {
        email,
      });
    } catch (e) {
      console.error(e.message);
    } finally {
      updateProfile({ email });
    }
  };

  // handel show module
  const handelShowModel = () => {
    setIsModuleShow(true);
  };

  // handel close module
  const handelCloseModule = () => {
    setIsModuleShow(false);
  };

  // delete anyonymous user account
  const delteUsere = async () => {
    const currentUserId = getCurrentUser().uid;
    const userDocRef = doc(firestore, "users", currentUserId);

    try {
      const deleteOperations = [
        // Delete 'lastMessage' collection if it exists
        deleteCollectionIfExists(userDocRef, "lastMessage"),

        // Delete 'messages' collection if it exists
        deleteCollectionIfExists(userDocRef, "messages"),

        // Delete user document
        deleteDoc(userDocRef),

        // Delete user authentication
        deleteUser(auth.currentUser),

        // Delete profile image
        deleteImagProfile(),
      ];

      // Execute all delete operations concurrently
      await Promise.all(deleteOperations);

      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error.message);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };

  const deleteCollectionIfExists = async (docRef, collectionName) => {
    console.log(collectionName);
    const collectionRef = collection(docRef, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) return;

    // delete all the documents in the collection
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  // delete user image
  const deleteImagProfile = async () => {
    if (!getCurrentUser()?.photoPath) return;
    const oldRef = ref(storage, getCurrentUser().photoPath);
    try {
      await deleteObject(oldRef);
      console.log("fill deleted successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // update the user isOnline property to true
  const updateIsOnline = async () => {
    try {
      const docRef = doc(firestore, "users", getCurrentUser().uid);
      await updateDoc(docRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // delete the current user from the all the chat view
  const deleteTheCurrentUserFromAllChat = async () => {
    try {
      const q = query(collection(firestore, "messages"));
      //  get all the chat
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // chcek if the current user is in the chat view whetever is it sender or receiver and update the chat view
        const docData = doc.data();
        if (
          docData.sender === getCurrentUser().uid ||
          docData.receiver === getSelectedUser().uid
        ) {
          const isSender = docData.sender === getCurrentUser().uid;
          // if the user is the sender delete the field sender and if the user is the receiver delete the field receiver
          if (isSender) {
            updateDoc(doc.ref, {
              sender: deleteField(),
            }).catch((err) => console.log(err));
          } else {
            updateDoc(doc.ref, {
              receiver: deleteField(),
            }).catch((err) => console.log(err));
          }
        }
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  // handel signout
  const handelSignout = () => {
    setIsLogoutLoading(true);
    // signout the user
    if (getCurrentUser()?.uid && !getIsAnonymousUser()) {
      updateIsOnline();
    }
    if (getIsAnonymousUser()) {
      delteUsere();
      deleteLastMessageCollection();
    }
    deleteTheCurrentUserFromAllChat();
    setTimeout(() => {
      localStorage.clear();
      setIsProfileShow(false);
      signOut(auth)
        .then(() => {
          setCurrentUser(null);
          console.log("signout succesfully");
        })
        .catch((error) => {
          console.log(error.message);
        });
      setIsLogoutLoading(false);
      navigate("/welcoome");
    }, 2000);
  };

  // delete the lastMessage collection of the user
  const deleteLastMessageCollection = async () => {
    try {
      const currentUserId = getCurrentUser().uid;
      const lastMessageCollection = collection(
        firestore,
        "users",
        currentUserId,
        "lastMessage"
      );
      getDocs(lastMessageCollection).then((snapshot) => {
        let arr = [];
        snapshot.forEach(async (doc) => {
          arr.push(doc.id);
          await deleteDoc(doc.ref);
        });
        arr?.map((userID) => deleteAllChatMessages(userID));
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  // delet all Messages collection
  const deleteAllChatMessages = async (id) => {
    const currentUserId = getCurrentUser().uid;
    const lastMessageCollection = collection(
      firestore,
      "users",
      currentUserId,
      "messages",
      id,
      "chat"
    );
    getDocs(lastMessageCollection).then((snapshot) => {
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
          .then(() => console.log("document delte with succes"))
          .catch((e) => console.log(e.message));
      });
    });
  };

  return (
    // Profile overlay contained inside the left sidebar (not full-screen)
    <div
      className="absolute inset-0 w-full h-full bg-white z-[200] flex flex-col gap-7 font-arabic"
      dir="rtl"
      aria-label="الملف الشخصي"
    >
      {!isImageView ? (
        <>
          {/* Header - WhatsApp green with back button */}
          <header className="text-white bg-whatsapp-primary-dark h-[65px] flex items-center px-4 flex-shrink-0">
            <div className="flex items-center gap-4 w-full">
              <Button
                onClick={handelBack}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/90 p-2"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <h4>الملف الشخصي</h4>
            </div>
          </header>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Profile Image - centered with camera and delete controls */}
            <div className="flex items-center justify-center mt-4">
              <div className="relative">
                <Avatar
                  className={cn(
                    "w-[150px] h-[150px] cursor-pointer",
                    isImageLoading && "disabel"
                  )}
                  onClick={handelViewImage}
                >
                  <AvatarImage
                    src={
                      file
                        ? URL.createObjectURL(file)
                        : getCurrentUser()?.photoURL || defaultAvatar
                    }
                    alt="avatar"
                  />
                  <AvatarFallback>
                    {getCurrentUser()?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Camera Upload Button */}
                <label
                  htmlFor="file-input"
                  className={cn(
                    "absolute left-0 bottom-4 p-2 bg-whatsapp-primary rounded-full w-10 h-10 flex items-center justify-center",
                    isImageLoading &&
                      "opacity-50 pointer-events-none cursor-not-allowed"
                  )}
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
                {getCurrentUser()?.photoURL && (
                  <div
                    className={cn(
                      "absolute right-0 bottom-4 bg-[#e74c3c] rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer",
                      isImageLoading &&
                        "opacity-50 pointer-events-none cursor-not-allowed"
                    )}
                    onClick={handelDeleteUserImg}
                  >
                    <Trash2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile info rows */}
            <div>
              {/* profile name */}
              <div className="px-4 py-2.5 border-b border-[#eae6df] grid grid-cols-[50px_1fr] items-center">
                <div className="text-gray-600">
                  <UserRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[1.1rem] font-normal text-gray-800">
                    الإسم
                  </h3>
                  <div className="relative flex items-center gap-2 mb-2">
                    <Input
                      type="text"
                      value={profile.displayName}
                      name="displayName"
                      onChange={handelProfileChange}
                      className={cn(
                        "border-0 border-b border-whatsapp-primary rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-whatsapp-primary text-gray-800",
                        isNameArabic ? "f-ar dr-ar" : "f-en dr-en",
                        !isDisplayNameEdit && "border-0"
                      )}
                      disabled={!isDisplayNameEdit}
                      ref={displayNameRef}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handelDisplayNameEdit()
                      }
                    />
                    {isDisplayNameEdit && (
                      <span
                        className={cn(
                          "text-xs text-gray-500",
                          displayNameRef.current?.value?.length > 0
                            ? "visible"
                            : "invisible"
                        )}
                      >
                        {maxDisplayNameLength - profile.displayName.length}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent"
                      onClick={handelDisplayNameEdit}
                    >
                      {isDisplayNameEdit ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Pencil className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div></div>
                <p className="text-sm text-gray-700">
                  هذا الاسم ليس كلمة مرور ولا رقم تعريف. إنما يكون هذا الاسم
                  ظاهراً لجهات اتصالك في واتساب.
                </p>
              </div>
              {/* profile status */}
              <div className="px-4 py-2.5 border-b border-[#eae6df] grid grid-cols-[50px_1fr] items-center">
                <div className="text-gray-600">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[1.1rem] font-normal text-gray-800">
                    الحالة
                  </h3>
                  <div className="relative flex items-center gap-2">
                    <Input
                      disabled={!isUserStatusEdit}
                      ref={userStatusRef}
                      type="text"
                      name="userStatus"
                      value={profile.userStatus}
                      onChange={handelProfileChange}
                      className={cn(
                        "border-0 border-b border-whatsapp-primary rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-whatsapp-primary text-gray-800",
                        isStatusArabic ? "f-ar dr-ar" : "f-en dr-en",
                        !isUserStatusEdit && "border-0"
                      )}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handelUserStatusEdit()
                      }
                    />
                    {isUserStatusEdit && (
                      <span
                        className={cn(
                          "text-xs text-gray-500",
                          displayNameRef.current?.value?.length > 0
                            ? "visible"
                            : "invisible"
                        )}
                      >
                        {maxUserStatusLength - profile.userStatus.length}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent"
                      onClick={handelUserStatusEdit}
                    >
                      {isUserStatusEdit ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Pencil className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {/* profile phone number */}
              {user?.phoneNumber && (
                <div className="px-4 py-2.5 border-b border-[#eae6df] grid grid-cols-[50px_1fr] items-center">
                  <div className="text-gray-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-normal text-gray-800">
                      رقم الهاتف
                    </h3>
                    <h4 className="dr-en text-gray-800">{user?.phoneNumber}</h4>
                  </div>
                </div>
              )}
              {/* profile email */}
              {getCurrentUser()?.email && (
                <div className="px-4 py-2.5 border-b border-[#eae6df] grid grid-cols-[50px_1fr] items-center">
                  <div className="text-gray-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-normal text-gray-800">
                      البريد الإلكتروني
                    </h3>
                    <h4 className="dr-en text-gray-800">{user?.email}</h4>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-4 flex flex-col gap-3">
              {isAnonymousUsere && (
                <div onClick={linkToGoogle}>
                  <Button className="w-full" variant="outline">
                    <div className="text-xl">
                      <FcGoogle />
                    </div>
                    <h4 className="dr-en f-ar">Google ربط حسابك ب </h4>
                  </Button>
                </div>
              )}
              {/* logout button */}
              <div
                onClick={getIsAnonymousUser() ? handelShowModel : handelSignout}
              >
                <Button className="w-full" variant="destructive">
                  <LogOut className="w-5 h-5" />
                  <h4 className="dr-ar f-ar">تسجيل الخروج</h4>
                </Button>
              </div>
            </div>
          </div>
          {isModuleshow && (
            <DeleteModule
              handelCancel={handelCloseModule}
              handelDelete={handelSignout}
              moduleTitle="delete geust account"
            />
          )}
        </>
      ) : (
        <ViewImage
          isImageLoading={isImageLoading}
          handelDeleteUserImg={handelDeleteUserImg}
          handleFile={handleFile}
          setIsImageView={setIsImageView}
          isOnlyShowImage={false}
        />
      )}
    </div>
  );
}
