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
      open={isViewFullImage}
      onOpenChange={setIsViewFullImage}
    />
  ) : (
    <div className="flex flex-col h-full">
      <header className="bg-whatsapp-primary p-4">
        <div className="flex items-center gap-3 text-white">
          <BiArrowBack 
            className="text-2xl cursor-pointer hover:opacity-80 transform rotate-180" 
            onClick={closeGalary} 
          />
          <h4 className="text-lg font-arabic">{displayName}</h4>
        </div>
      </header>
      <section className="flex-1 overflow-auto p-2">
        <div className="grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div 
              key={image.src || index}
              className="aspect-square relative overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handelSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
