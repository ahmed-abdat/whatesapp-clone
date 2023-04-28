import { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import "./styles/Swiper.css";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Swiper({ images, selectedImage }) {
  const selectedImageIndex = images.findIndex(
    (image) => image.src === selectedImage
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




  return (
    <div className="swiper--container">
      {/* render the current image and add a cursor to navigate between images */}
      <div
        className={`swiper--wrapper`}
        style={{ transform: `translateX(-${imageIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="swiper--image">
            {/* <img src={image.src} alt="" onClick={()=> setIsArrowShow(prev => !prev)} /> */}
            <LazyLoadImage
              alt="image"
              height={"100%"}
              src={image.src}
              onClick={()=> setIsArrowShow(prev => !prev)}
              width={"100%"}
              effect="blur"
            />
            {/* carsor for next and prev image */}
            {(!isLastIndex && isArrowShow)&& (
              <div className="arrow--container next" onClick={handelNextImage}>
                <div className="swiper--next d-f" >
                <BiChevronLeft />
              </div>
              </div>
            )}
            {(!isFirstIndex && isArrowShow) && (
             <div className="arrow--container prev" onClick={handelPrevImage}>
               <div className="swiper--prev d-f" >
                <BiChevronRight />
              </div>
             </div>
            )}
            <div className="swipper--content">
              <p
                className={`content ${isArabic ? "f-ar dr-ar" : "f-en dr-en"}`}
              >
                {image.alt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
