import { MdClose } from "react-icons/md";
import Swiper from "../Swiper";
import "./styles/ViewFullImage.css";


export default function ViewFullImage({ file, setIsImageSelected , images}) {
  // handel Back
  const handelBack = () => {
    setIsImageSelected(false);
  };

  // sort the images by the 

  //   is content Arabic
  const isArabic = /[\u0600-\u06FF]/.test(file.content);

  return (
    <div className="viewFullPage">
      <div className="header">
        <div className="icon" onClick={handelBack}>
          <MdClose />
        </div>
      </div>
      <div className="image d-f">
      <Swiper images={images} selectedImage={file.img}/>
      </div>
    </div>
  );
}
