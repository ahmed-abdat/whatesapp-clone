import { MdClose } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight, BiArrowBack } from "react-icons/bi";
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FiDownload } from "react-icons/fi";
import { saveAs } from 'file-saver';
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import useSelectedUser from "../../store/useSelectedUser";

export default function ViewFullImage({ 
  selectedImage, 
  setIsImageSelected, 
  images
}) {
  const getSelectedUser = useSelectedUser(state => state.getSelectedUser);
  const selectedUser = getSelectedUser();

  // Handle close
  const handleClose = () => {
    setIsImageSelected(false);
  };

  


  const selectedImageIndex = images.findIndex(
    (image) => image.src === selectedImage.src
  );

  // track the inedx of the selected image
  const [imageIndex, setImageIndex] = useState(selectedImageIndex);
  const [isLastIndex, setIsLastIndex] = useState(false);
  const [isFirstIndex, setIsFirstIndex] = useState(false);
  const [isArrowShow, setIsArrowShow] = useState(true);
  

  // handel go to next image (right arrow in RTL)
  const handelNextImage = () => {
    if (imageIndex === images.length - 1) return;
    setImageIndex((prevImageIndex) => prevImageIndex + 1);
  };

  // handel go to previous image (left arrow in RTL)
  const handelPrevImage = () => {
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
    <div className="absolute inset-0 z-50 flex flex-col bg-white/90 backdrop-blur-sm">
      {/* Minimal header */}
      <div className="flex items-center justify-between p-3 bg-white/95 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            <MdClose className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={downloadImage}
          >
            <FiDownload className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Image carousel container */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="relative w-full h-full flex items-center px-16">
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
                  className="max-w-full max-h-[85%] object-contain cursor-pointer"
                  effect="blur"
                />

                {/* Subtle navigation arrows */}
                {/* Previous button (right arrow in RTL) */}
                {!isLastIndex && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 backdrop-blur-sm transition-all duration-200 opacity-70 hover:opacity-100"
                    onClick={handelPrevImage}
                  >
                    <BiChevronRight className="h-5 w-5" />
                  </Button>
                )}
                
                {/* Next button (left arrow in RTL) */}
                {!isFirstIndex && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-500/20 text-gray-600 hover:bg-gray-500/30 backdrop-blur-sm transition-all duration-200 opacity-70 hover:opacity-100"
                    onClick={handelNextImage}
                  >
                    <BiChevronLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple caption */}
      {images[imageIndex]?.alt && (
        <div className="bg-white/95 border-t border-gray-200/50 p-4 text-center">
          <p className={cn(
            "text-gray-700 text-sm leading-relaxed",
            isArabic(images[imageIndex].alt) ? "font-arabic" : ""
          )}>
            {findEmoji(images[imageIndex].alt).map((content, index) => (
              <React.Fragment key={index}>{content} </React.Fragment>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
