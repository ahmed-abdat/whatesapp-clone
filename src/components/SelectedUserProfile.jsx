import { BiArrowBack } from "react-icons/bi";
import useSelectedUser from "../store/useSelectedUser";
import defaultAvatar from "../assets/img/default-avatar.svg";
import ViewImage from "./ViewImage";
import ViewFullImage from "./ChatePage/ViewFullImage";
import GraitherThen from "./svg/GratherThenIcon";
import "./styles/SelectedUserProfile.css";
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
import { Sheet, SheetContent } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function SelectedUserProfile({ setisProfileShow, isOpen = true }) {
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && setisProfileShow(false)}>
      <SheetContent 
        side="left" 
        className="selected-user-profile p-0 border-0 max-w-none w-full sm:max-w-none"
      >
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
          <header>
            <div className="header--text">
              <Button
                variant="ghost"
                size="icon"
                className="text-inherit hover:bg-black/10 p-2"
                onClick={() => setisProfileShow(false)}
              >
                <BiArrowBack className="r-180" />
              </Button>
              <h4 className="f-ar"> معلومات جهة الاتصال</h4>
            </div>
          </header>
          {/* image and display Name  */}
          <section className="image-displayName">
            <div className="img d-f">
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
            <div className="selcted-user-info">
              <h2
                className={`${
                  isArabic(getSelectedUser().displayName) ? "f-ar" : "f-en"
                }`}
              >
                {getSelectedUser()?.displayName}
              </h2>
              <p className="f-en dr-en">
                {getSelectedUser()?.email
                  ? getSelectedUser().email
                  : getSelectedUser()?.phoneNumber}
              </p>
            </div>
          </section>
          {/* status */}
          <section className="status">
            <p
              className={`${
                isArabic(getSelectedUser().userStatus)
                  ? "f-ar dr-ar"
                  : "f-en dr-en"
              }`}
            >
              {getSelectedUser().userStatus}
            </p>
          </section>
          {/* media */}
          <section className="media">
            <p className="media--header" onClick={() => setIsGalaryShow(true)}>
              صور و الوسائط <span>{images.length}</span>
              <GraitherThen />
            </p>
            {isImagesLoading ? (
              <SpinerLoader />
            ) : (
              <div className="media--images">
                {selecteduserImages.map((image) => (
                  <img
                    src={image.src}
                    key={image.src}
                    alt="media"
                    onClick={() => handelSelectedImage(image)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
        )}
      </SheetContent>
    </Sheet>
  );
}
