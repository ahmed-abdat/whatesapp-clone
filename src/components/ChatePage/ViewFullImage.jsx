import { MdClose } from "react-icons/md";
import "./styles/ViewFullImage.css";

export default function ViewFullImage({ file, setIsImageSelected }) {
  // handel Back
  const handelBack = () => {
    setIsImageSelected(false);
  };

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
        <img src={file.img} alt="" />
      </div>
      {file.content && <p className={`content ${isArabic ? 'f-ar dr-ar' : 'f-en dr-en'}`}>{file.content}</p>}
    </div>
  );
}
