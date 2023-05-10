import { MdClose } from "react-icons/md";
import Swiper from "../Swiper";
import "./styles/ViewFullImage.css";


export default function ViewFullImage({ selectedImage, setIsImageSelected , images}) {
  // handel Back
  const handelBack = () => {
    setIsImageSelected(false);
  };


  // sort the images by the 


  return (
    <div className="viewFullPage">
      <div className="header">
        <div className="icon" onClick={handelBack}>
          <MdClose />
        </div>
      </div>
      <div className="image d-f">
      <Swiper images={images} selectedImageSrc={selectedImage.src}/>
      </div>
    </div>
  );
}
