import { MdClose } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FiDownload } from "react-icons/fi";
import { saveAs } from 'file-saver';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
// import "./styles/ViewFullImage.css"; // Removed - using Tailwind CSS only
// import "../styles/Swiper.css"; // Removed - using Tailwind CSS only


export default function ViewFullImage({ 
  selectedImage, 
  setIsImageSelected, 
  images, 
  open = true,
  onOpenChange 
}) {


  // Handle close with both callbacks
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      onOpenChange?.(false);
      setIsImageSelected?.(false);
    }
  };

  


  const selectedImageIndex = images.findIndex(
    (image) => image.src === selectedImage.src
  );

  // track the inedx of the selected image
  const [imageIndex, setImageIndex] = useState(selectedImageIndex);
  const [isLastIndex, setIsLastIndex] = useState(false);
  const [isFirstIndex, setIsFirstIndex] = useState(false);
  const [isArrowShow, setIsArrowShow] = useState(true);
  

  // handel next image
  const handelPrevImage = () => {
    if (imageIndex === images.length - 1) return;
    setImageIndex((prevImageIndex) => prevImageIndex + 1);
  };

  // handel prev image
  const handelNextImage = () => {
    if (imageIndex === 0) return;
    setImageIndex((prevImageIndex) => prevImageIndex - 1);
  };

  //   check if the current image index is the first index or the last index
  useEffect(() => {
    if (imageIndex === 0) {
      setIsLastIndex(true);
    } else {
      setIsLastIndex(false);
    }
    if (imageIndex === images.length - 1) {
      setIsFirstIndex(true);
    } else {
      setIsFirstIndex(false);
    }
  }, [imageIndex, images.length]);

  //   is content Arabic
  const isArabic = useCallback((content) => {
    return /[\u0600-\u06FF]/.test(content);
  }, []);

    // find the emoji in the message and replace it with the emoji image
    const findEmoji = (message) => {
      const words = message?.split(/\s+/);
      const urlReg = /https:\/\/cdn\.jsdelivr\.net\/npm\/emoji-datasource-apple\/img\/apple\/64\/[^/]+\.png/gim;
      const newArray = [];
      if(!words) return newArray;
      
      for (const word of words) {
        const urlMatch = word.match(urlReg);
    
        if (urlMatch) {
          newArray.push(<img src={urlMatch[0]} alt={urlMatch[0]} className="emoji" />);
        } else if (newArray.length > 0 && typeof newArray[newArray.length - 1] === 'string') {
          newArray[newArray.length - 1] += ' ' + word;
        } else {
          newArray.push(word);
        }
      }
      
      return newArray
    };


  // handel download image
  const downloadImage = () => {
    const imageURL = images[imageIndex].src;
    const imageName = imageURL?.split('?')[0].split('/')[7];
    saveAs(imageURL, imageName);
  } 

  // sort the images by the 



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-full max-h-full w-screen h-screen p-0 border-0 bg-black/95 flex flex-col"
        showCloseButton={false}
      >
        {/* Modern header with actions */}
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
              onClick={() => handleOpenChange(false)}
            >
              <MdClose className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
              onClick={downloadImage}
            >
              <FiDownload className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Image carousel container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="relative w-full h-full flex items-center">
            {/* Image wrapper with transform for carousel */}
            <div
              className="flex transition-transform duration-300 ease-out w-full h-full"
              style={{ transform: `translateX(-${imageIndex * 100}%)` }}
            >
              {images.map((image, idx) => (
                <div key={image.src} className="w-full h-full flex-shrink-0 flex items-center justify-center relative">
                  <LazyLoadImage
                    alt={image.alt || "Image"}
                    src={image.src}
                    onClick={() => setIsArrowShow(prev => !prev)}
                    className="max-w-full max-h-full object-contain cursor-pointer"
                    effect="blur"
                  />

                  {/* Navigation arrows with better UX */}
                  {isArrowShow && imageIndex < images.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
                        "bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm",
                        isFirstIndex && "opacity-50 pointer-events-none"
                      )}
                      onClick={handelPrevImage}
                    >
                      <BiChevronLeft className="h-6 w-6" />
                    </Button>
                  )}
                  
                  {isArrowShow && imageIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
                        "bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm",
                        isLastIndex && "opacity-50 pointer-events-none"
                      )}
                      onClick={handelNextImage}
                    >
                      <BiChevronRight className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern caption overlay */}
        {images[imageIndex]?.alt && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto">
              <p className={cn(
                "text-white text-base leading-relaxed",
                isArabic(images[imageIndex].alt) ? "font-arabic text-right" : "text-left"
              )}>
                {findEmoji(images[imageIndex].alt).map((content, index) => (
                  <React.Fragment key={index}>{content} </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {imageIndex + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
