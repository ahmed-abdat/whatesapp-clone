import { BiArrowBack } from "react-icons/bi";
import Camera from "./svg/Camera";
import useUser from "../store/useUser";
import { MdDelete } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/viewImage.css";
import defaultAvatar from "../assets/img/default-avatar.svg";
export default function ViewImage({
  isImageLoading,
  handelDeleteUserImg,
  handleFile,
  setIsImageView,
  isOnlyShowImage,
  title = "الصورة الشخصية",
  image 
}) {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  // handel back
  const handelBack = () => {
    setIsImageView(false);
  };

  return (
    <div className="view-image-container">
      <header className="header">
        <div className="header--left">
          <BiArrowBack className="r-180" onClick={handelBack} />
          <h4> {title} </h4>
        </div>
        {!isOnlyShowImage && (
          <div className="header--right">
            <label
              htmlFor="file-input"
              className={`icon d-f ${isImageLoading ? "disabel" : ""}`}
            >
              <Camera />
            </label>
            <input
              onChange={handleFile}
              id="file-input"
              type="file"
              name="file"
              style={{ display: "none" }}
            />
            {getCurrentUser()?.photoURL && (
              <div
                className={`deleteImg d-f ${isImageLoading ? "disabel" : ""}`}
                onClick={handelDeleteUserImg}
              >
                <MdDelete />
              </div>
            )}
          </div>
        )}
      </header>
      {!isOnlyShowImage && (
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
      <div className="view-image d-f">
        <div className="view-image--img">
          <img src={ image || defaultAvatar} alt="" />
        </div>
      </div>
    </div>
  );
}
