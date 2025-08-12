import { BiArrowBack } from "react-icons/bi";
import { MdDelete, MdEdit } from "react-icons/md";
import { FiCamera } from "react-icons/fi";
import useUser from "../store/useUser";
import defaultAvatar from "../assets/img/default-avatar.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";

export default function ViewImage({
  isImageLoading,
  handelDeleteUserImg,
  handleFile,
  setIsImageView,
  isOnlyShowImage,
  title = "الصورة الشخصية",
  image,
  open = true,
  onOpenChange
}) {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  
  // Handle close with both callbacks
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      onOpenChange?.(false);
      setIsImageView?.(false);
    }
  };

  // Handle back button
  const handelBack = () => {
    handleOpenChange(false);
  };

  const currentUser = getCurrentUser();
  const displayImage = image || currentUser?.photoURL || defaultAvatar;
  const hasCustomImage = currentUser?.photoURL && currentUser.photoURL !== defaultAvatar;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md gap-0 p-0 rounded-2xl overflow-hidden">
          {/* Modern header with gradient */}
          <DialogHeader className="bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                  onClick={handelBack}
                >
                  <BiArrowBack className="h-5 w-5" />
                </Button>
                
                <DialogTitle className="font-arabic text-lg font-medium">
                  {title}
                </DialogTitle>
              </div>

              {/* Action buttons */}
              {!isOnlyShowImage && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 text-white hover:bg-white/20 rounded-full relative",
                      isImageLoading && "opacity-50 pointer-events-none"
                    )}
                    disabled={isImageLoading}
                  >
                    <label
                      htmlFor="file-input"
                      className="cursor-pointer flex items-center justify-center w-full h-full"
                    >
                      <FiCamera className="h-4 w-4" />
                    </label>
                    <input
                      onChange={handleFile}
                      id="file-input"
                      type="file"
                      name="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </Button>
                  
                  {hasCustomImage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 text-white hover:bg-red-500/20 rounded-full",
                        isImageLoading && "opacity-50 pointer-events-none"
                      )}
                      onClick={handelDeleteUserImg}
                      disabled={isImageLoading}
                    >
                      <MdDelete className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Image display area with modern styling */}
          <div className="p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Large avatar with modern shadow */}
                <Avatar className="w-48 h-48 ring-4 ring-white shadow-2xl">
                  <AvatarImage 
                    src={displayImage} 
                    alt={title}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-whatsapp-primary to-whatsapp-secondary text-white text-4xl font-bold">
                    {currentUser?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Loading overlay */}
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Edit indicator for editable mode */}
                {!isOnlyShowImage && !isImageLoading && (
                  <div className="absolute bottom-2 right-2 bg-whatsapp-primary text-white p-2 rounded-full shadow-lg">
                    <MdEdit className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* User info */}
            {currentUser?.displayName && (
              <div className="mt-6 text-center">
                <h3 className="font-arabic text-lg font-medium text-gray-900 dark:text-gray-100">
                  {currentUser.displayName}
                </h3>
                {currentUser?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentUser.email}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Instructions for editable mode */}
          {!isOnlyShowImage && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center font-arabic">
                اضغط على أيقونة الكاميرا لتحديث الصورة الشخصية
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </>
  );
}
