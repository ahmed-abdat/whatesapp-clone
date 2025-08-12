import { BiArrowBack } from "react-icons/bi";
import useSelectedUser from "../store/useSelectedUser";
import defaultAvatar from "../assets/img/default-avatar.svg";
import ViewImage from "./ViewImage";
import ViewFullImage from "./ChatePage/ViewFullImage";
import GraitherThen from "./svg/GratherThenIcon";
// import "./styles/SelectedUserProfile.css"; // Removed - using Tailwind CSS only
import { useState } from "react";
import { useEffect } from "react";
import useUser from "../store/useUser";
import {
  collection,
  getDocs,
  query,
  getFirestore,
  where,
  limit,
} from "firebase/firestore/lite";
import { app } from "../config/firebase";
import SpinerLoader from "./SpinerLoader";
import SelectedUserGalary from "./SelectedUserGalary";
// Removed Sheet import - using inline layout instead
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function SelectedUserProfile({ setisProfileShow }) {
  const getSelectedUser = useSelectedUser((state) => state.getSelectedUser);
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  const [images, setImages] = useState([]);
  const [isImagesLoading, setisImagesLoading] = useState(false);

  // fetch all the images in chat
  useEffect(() => {
    const firestore = getFirestore(app);
    const messageRef = collection(
      firestore,
      "users",
      getCurrentUser().uid,
      "messages",
      getSelectedUser().uid,
      "chat"
    );
    const imageFormats = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/webp",
      "image/svg+xml",
      "image/heic",
      "image/raw",
    ];
    const q = query(messageRef, where("media.type", 'in', imageFormats) , limit(20))
    setisImagesLoading(true);
    getDocs(q).then((querySnapshot) => {
      const images = [];
      querySnapshot.forEach((doc) => {
        images.push({
          src : doc.data().media.src,
          alt: doc.data().content,
          time: doc.data().createdAt?.seconds
            ? doc.data().createdAt.seconds
            : doc.data().createdAt,
        });
      });
      setImages(images);
      setisImagesLoading(false);
    });
  }, []);

  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const selecteduserImages =
    images.length > 0
      ? images.sort((a, b) => b.time * 1000 - a.time * 1000).slice(0, 3)
      : [];

  // state
  const [isImageView, setIsImageView] = useState(false);
  const [isSelectedUserChange, setIsSelectedUserChange] = useState(false);
  const [viewFullImage, setViewFullImage] = useState(null);
  const [isViewFullImage, setIsViewFullImage] = useState(false);
  const [isGalaryShow , setIsGalaryShow] = useState(false)

  // close the selected user profile and the view image when the selected user change
  useEffect(() => {
    if (isSelectedUserChange) {
      setisProfileShow(false);
      setIsImageView(false);
      setIsSelectedUserChange(false);
    } else {
      setIsSelectedUserChange(true);
    }
  }, [getSelectedUser()]);

  // handel Selected image
  const handelSelectedImage = (image) => {
    setViewFullImage(image);
    setIsViewFullImage(true);
  };

  // handel close galary
  const handelCloseGalary = () => {
    setIsGalaryShow(false)
  }


  return (
    <div className="w-full h-full bg-gray-100 flex flex-col" dir="rtl">
        {isImageView && getSelectedUser()?.photoURL ? (
          <ViewImage
            title={getSelectedUser().displayName}
            isOnlyShowImage={true}
            setIsImageView={setIsImageView}
            image={getSelectedUser()?.photoURL}
          />
        ) : viewFullImage && isViewFullImage ? (
          <ViewFullImage
            selectedImage={viewFullImage}
            images={images}
            setIsImageSelected={setIsViewFullImage}
          />
        ) : isGalaryShow ? (
         <SelectedUserGalary closeGalary={handelCloseGalary} displayName={getSelectedUser().displayName} images={images}/>
        ) : (
          <>
          <header className="text-black  bg-whatsapp-bg h-[65px] flex items-center px-4 flex-shrink-0">
            <div className="flex w-full items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-inherit hover:bg-black/10 p-2 text-2xl"
                onClick={() => setisProfileShow(false)}
              >
                <BiArrowBack className="rotate-180" />
              </Button>
              <h4 className="text-lg font-arabic font-normal text-inherit"> معلومات جهة الاتصال</h4>
            </div>
          </header>
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* image and display Name  */}
            <section className="pt-7 px-7 pb-5 bg-white shadow-sm mb-2.5">
            <div className="mb-4 flex justify-center">
              <Avatar 
                className="w-[200px] h-[200px] cursor-pointer"
                onClick={() => setIsImageView(true)}
              >
                <AvatarImage
                  src={getSelectedUser()?.photoURL || defaultAvatar}
                  alt="selecteduser image"
                />
                <AvatarFallback>
                  {getSelectedUser()?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <h2
                className={cn(
                  "text-gray-700 text-2xl font-medium",
                  isArabic(getSelectedUser().displayName) ? "font-arabic" : "font-english"
                )}
              >
                {getSelectedUser()?.displayName}
              </h2>
              <p className="mt-1 text-gray-400 text-base font-english">
                {getSelectedUser()?.email
                  ? getSelectedUser().email
                  : getSelectedUser()?.phoneNumber}
              </p>
            </div>
          </section>
          {/* status */}
          <section className="px-6 py-6 bg-white shadow-sm mb-2.5">
            <p
              className={cn(
                "break-words",
                isArabic(getSelectedUser().userStatus)
                  ? "font-arabic text-right"
                  : "font-english text-left"
              )}
            >
              {getSelectedUser().userStatus}
            </p>
          </section>
          {/* media */}
          <section className="cursor-pointer flex flex-col p-3 mb-0 relative min-h-[200px] gap-4 bg-white shadow-sm">
            <p className="cursor-pointer flex items-center gap-2 text-gray-500 text-sm leading-6 mb-2 font-arabic" onClick={() => setIsGalaryShow(true)}>
              صور و الوسائط <span>{images.length}</span>
              <GraitherThen className="rotate-180" />
            </p>
            {isImagesLoading ? (
              <SpinerLoader />
            ) : (
              <div className="h-4/5 grid grid-cols-3 gap-x-2 w-full flex-1">
                {selecteduserImages.map((image) => (
                  <img
                    src={image.src}
                    key={image.src}
                    alt="media"
                    className="cursor-pointer rounded-lg bg-gray-100 mb-1.5 w-full h-[90%] max-h-[170px] object-cover border border-white"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,0) 70%, rgba(0,0,0,.6) 100%)'
                    }}
                    onClick={() => handelSelectedImage(image)}
                  />
                ))}
              </div>
            )}
          </section>
          </div>
        </>
        )}
    </div>
  );
}
