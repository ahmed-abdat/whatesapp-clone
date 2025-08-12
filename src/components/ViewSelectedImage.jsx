import React, { useRef, useState } from "react";
import Send from "./svg/Send";
import { FaKeyboard } from "react-icons/fa";
import { MoreVertical, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import SmileFace from "./svg/SmileFace";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";

export default function ViewSelectedImage({
  file,
  setFile,
  displayName,
  handelMessage,
  isArabic,
  handelSendMessage,
  message,
  EmojyPiker,
  images = [], // Gallery images from chat
  isGalleryMode = false, // Mode: preview upload or browse gallery
}) {

  const [isEmojiPikerShow, setIsEmojiPickerShow] = useState(false);
  const messageInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [api, setApi] = useState(null);

  const [isInputFocus , setIsInputFocus] = useState(false)
  
  // handel show Emoji picker component
  const handelShowEmojiPicker = () => {
    setIsEmojiPickerShow((prev) => !prev);
    if (isEmojiPikerShow) {
      messageInputRef.current.focus();
      setIsInputFocus(true)
    } else {
      messageInputRef.current.blur();
      setIsInputFocus(true)
    }
  };

  // handel input focus
  const handelInputFocus = () => {
    setIsEmojiPickerShow(false)
    setIsInputFocus(true)
  }

  // handel input blur
  const handelInputBlur = () => {
    setIsInputFocus(false)
    setIsEmojiPickerShow(false)
  }

  // Track carousel changes for image counter
  React.useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    };

    setCurrentImageIndex(api.selectedScrollSnap());
    api.on("select", handleSelect);
    
    return () => api.off("select", handleSelect);
  }, [api]);



  return (
    <Dialog open={true} onOpenChange={() => setFile(null)}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] h-[100vh] w-[100vw] bg-black border-0 p-0 rounded-none">
        <div className="flex flex-col h-full">
          {/* WhatsApp-style Header */}
          <div className="flex items-center justify-between p-4 bg-teal-600 text-white">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 p-2"
                onClick={() => {
                  if (isGalleryMode && images.length > 0 && images[currentImageIndex]?.src) {
                    const link = document.createElement('a');
                    link.href = images[currentImageIndex].src;
                    link.download = `image-${currentImageIndex + 1}.jpg`;
                    link.click();
                  } else if (file) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(file);
                    link.download = file.name;
                    link.click();
                  }
                }}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 p-2">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black">
                  <DropdownMenuItem>حفظ الصورة</DropdownMenuItem>
                  <DropdownMenuItem>مشاركة</DropdownMenuItem>
                  <DropdownMenuItem>نسخ</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 p-2"
                onClick={() => setFile(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative bg-black">
            {isGalleryMode && images.length > 0 ? (
              <div className="w-full h-full relative">
                <Carousel 
                  setApi={setApi}
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  className="w-full h-full"
                >
                  <CarouselContent className="h-full">
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="h-full">
                        <div className="flex items-center justify-center h-full">
                          <img
                            src={image.src}
                            alt={image.alt || `Gallery image ${index + 1}`}
                            className="max-h-[calc(100vh-200px)] max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* WhatsApp-style navigation buttons */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white border-0 z-10"
                        onClick={() => api?.scrollPrev()}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white border-0 z-10"
                        onClick={() => api?.scrollNext()}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </Carousel>
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} من {images.length}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <img 
                  src={file ? URL.createObjectURL(file) : ""} 
                  alt="preview" 
                  className="max-h-[calc(100vh-200px)] max-w-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Footer - Only show for file upload mode */}
          {!isGalleryMode && (
            <div className="p-4 bg-black border-t border-gray-700">
              <form onSubmit={handelSendMessage} className="flex items-center flex-col gap-2">
                <div className="rounded-3xl bg-gray-700/90 px-4 w-full flex items-center gap-3 py-3 max-w-2xl mx-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-2xl text-gray-100 hover:bg-gray-600/50 p-0 h-auto w-auto"
                    onClick={handelShowEmojiPicker}
                  >
                    {isEmojiPikerShow ? <FaKeyboard /> : <SmileFace />}
                  </Button>
                  <input
                    type="text"
                    placeholder="إضافة شرح..."
                    onFocus={handelInputFocus}
                    onBlur={handelInputBlur}
                    ref={messageInputRef}
                    onChange={handelMessage}
                    onKeyDown={(e) => {
                      e.key === "Enter" && console.log("send message");
                    }}
                    value={message}
                    className={cn(
                      "flex-1 bg-transparent text-gray-100 placeholder:text-gray-100 whitespace-pre-wrap break-words leading-6 text-lg border-none outline-none",
                      isArabic ? "font-arabic text-right" : "font-english text-left"
                    )}
                  />
                </div>
                <div className={cn(
                  "flex items-center justify-between w-full px-6 py-2 transition-all duration-300 ease-in-out max-w-2xl mx-auto",
                  isInputFocus && "bg-gray-800/30"
                )}>
                  <p className="text-lg font-normal px-4 py-2 bg-gray-600 text-white rounded-3xl font-english text-left">{displayName}</p>
                  <Button
                    type="submit"
                    className="w-12 h-12 rounded-full bg-whatsapp-primary hover:bg-whatsapp-primary-dark shadow-md"
                  >
                    <Send className="text-white" />
                  </Button>
                </div>
              </form>
              {isEmojiPikerShow && (
                <div className="w-full mt-2 max-w-2xl mx-auto">
                  {EmojyPiker}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
