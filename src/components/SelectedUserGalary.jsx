import { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import ViewFullImage from "./ChatePage/ViewFullImage";
export default function SelectedUserGalary({
  closeGalary,
  displayName,
  images,
}) {
  const [viewFullImage, setViewFullImage] = useState(null);
  const [isViewFullImage, setIsViewFullImage] = useState(false);


  // handel Selected image
  const handelSelectedImage = (image) => {
    setViewFullImage(image);
    setIsViewFullImage(true);
  };
  return viewFullImage && isViewFullImage ? (
    <ViewFullImage
      selectedImage={viewFullImage}
      images={images}
      setIsImageSelected={setIsViewFullImage}
    />
  ) : (
    <>
      <header className="bg-green">
        <div className="header--text">
          <BiArrowBack className="r-180" onClick={closeGalary} />
          <h4 className="f-ar"> {displayName} </h4>
        </div>
      </header>
      <section className="galary">
        {images.map((image) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            onClick={() => handelSelectedImage(image)}
          />
        ))}
      </section>
    </>
  );
}
