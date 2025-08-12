import { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
// import "./styles/Swiper.css"; // Removed - using Tailwind CSS only
import {FiDownload} from "react-icons/fi"
import { storage } from "../config/firebase";
import { saveAs } from 'file-saver'
import { getDownloadURL, ref } from "firebase/storage";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function Swiper({ images, selectedImageSrc }) {
  const selectedImageIndex = images.findIndex(
    (image) => image.src === selectedImageSrc
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
      const words = message.split(/\s+/);
      const urlReg = /https:\/\/cdn\.jsdelivr\.net\/npm\/emoji-datasource-apple\/img\/apple\/64\/[^/]+\.png/gim;
      const newArray = [];
      
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
    console.log(images[imageIndex].src);
    const imageName = imageURL.split('?')[0].split('/')[7];
    saveAs(imageURL, imageName);
  } 






  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Download button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-[210] h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
        onClick={downloadImage}
      >
        <FiDownload className="h-5 w-5" />
      </Button>
      
      {/* Image counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[210] bg-black/60 text-white px-2.5 py-1 rounded-full text-xs backdrop-blur-sm">
        {imageIndex + 1} من {images.length}
      </div>
      
      {/* render the current image and add a cursor to navigate between images */}
      <div
        className="flex items-center w-full h-full relative transition-all duration-300 cubic-bezier(0.4,0,0.2,1)"
        style={{ transform: `translateX(-${imageIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.src} className="min-w-full relative flex flex-col items-center">
            {/* <img src={image.src} alt="" onClick={()=> setIsArrowShow(prev => !prev)} /> */}
            <LazyLoadImage
              alt="image"
              height={"100%"}
              src={image.src}
              onClick={()=> setIsArrowShow(prev => !prev)}
              width={"100%"}
              effect="blur"
            />
            {/* Navigation arrows with proper RTL positioning */}
            {/* Previous button (right arrow in RTL) - shows when not at first image */}
            {isArrowShow && !isLastIndex && (
              <div className={cn(
                "absolute w-[15%] h-full bg-transparent top-0 flex items-center justify-center z-[200] right-0"
              )} onClick={handelPrevImage}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shadow-lg bg-white/90 w-10 h-10 rounded-full text-gray-800 hover:bg-white transition-all duration-200 border-0"
                  disabled={isLastIndex}
                >
                  <BiChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            {/* Next button (left arrow in RTL) - shows when not at last image */}
            {isArrowShow && !isFirstIndex && (
             <div className={cn(
               "absolute w-[15%] h-full bg-transparent top-0 flex items-center justify-center z-[200] left-0"
             )} onClick={handelNextImage}>
               <Button
                 variant="ghost"
                 size="icon"
                 className="shadow-lg bg-white/90 w-10 h-10 rounded-full text-gray-800 hover:bg-white transition-all duration-200 border-0"
                 disabled={isFirstIndex}
               >
                 <BiChevronLeft className="h-5 w-5" />
               </Button>
             </div>
            )}
            <div className="absolute bottom-[-8rem] left-1/2 transform -translate-x-1/2">
              <p
                className={`${isArabic(image.alt) ? "font-arabic text-right" : "font-english text-left"}`}
              >
                {
                  findEmoji(image.alt).map((content, index) => (
                    <React.Fragment key={index}>{content} </React.Fragment>
                  ))
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
