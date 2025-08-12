import { useState, useEffect, useRef } from "react";
import Play from "../svg/Play";
import WaveSurfer from "wavesurfer.js";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import { IoIosPause } from "react-icons/io";

// import "./styles/AudioPlayer.css"; // Removed - using Tailwind CSS only
import SpinerLoader from "../SpinerLoader";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";

const AudioPlayer = ({
  audioSrc,
  isPreview = true,
  avatar ,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duratione, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);



  if (!audioSrc)  return null;


  const waveformRef = useRef();
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        autoCenter: true,
        waveColor: "hsl(var(--muted-foreground))",
        progressColor: "hsl(var(--whatsapp-primary))",
        cursorColor: "hsl(var(--whatsapp-primary))",
        hideScrollbar: true,
        cursorWidth: 2,
        scrollParent: false,
        responsive: true,
        height: !isPreview ? 24 : 35,
        maxCanvasWidth: 200,
        barHeight : 3,
        barGap : 1.5,
        removeMediaElementOnDestroy: true,
        autoCenterRate: 1,
        barWidth: 2.5,
        fillParent: true,
        barRadius: 3,
        barMinHeight: 1.5,
      });
      wavesurfer.current.load(audioSrc);
    }
    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
      wavesurfer.current.stop();
    });

    wavesurfer.current.on("ready", () => {
      setIsAudioLoaded(true);
      setDuration(wavesurfer.current.getDuration());
    });
    wavesurfer.current.on("error", () => {
      setIsAudioLoaded(false);
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });
  }, []);

  const handelPausePlay = () => {
    wavesurfer.current.playPause();
    setIsPlaying(wavesurfer.current?.isPlaying());
  };

  const formatTimeAudioRecording = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    const secondValue = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${secondValue}`;
  };

  const remainingTime = () => {
    const finalTime = currentTime === 0 ? duratione : currentTime;
    return formatTimeAudioRecording(finalTime);
  };

  return (
    <>
      {isPreview ? (
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <Button
            onClick={handelPausePlay}
            size="icon"
            variant="ghost"
            className="w-8 h-8 flex-shrink-0"
            aria-label={isPlaying && isAudioLoaded ? "Pause" : "Play"}
          >
            {isPlaying && isAudioLoaded ? (
              <IoIosPause className="w-4 h-4" />
            ) : (
              <Play wh={16} />
            )}
          </Button>
          <div
            ref={waveformRef}
            className="flex-1 min-w-0"
            style={{ width: "100%" }}
          ></div>
          {wavesurfer.current && (
            <span className="text-xs text-gray-600 font-mono min-w-fit">
              {remainingTime()}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl max-w-sm">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={avatar || defaultAvatar} alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
            {isPlaying && isAudioLoaded ? (
              <Button
                onClick={handelPausePlay}
                size="icon"
                variant="ghost"
                className="w-10 h-10 rounded-full bg-whatsapp-primary hover:bg-whatsapp-primary-dark text-white"
                aria-label="Pause"
              >
                <IoIosPause className="w-6 h-6" />
              </Button>
            ) : isAudioLoaded ? (
              <Button 
                onClick={handelPausePlay} 
                size="icon"
                variant="ghost"
                className="w-10 h-10 rounded-full bg-whatsapp-primary hover:bg-whatsapp-primary-dark text-white"
                aria-label="Play"
              >
                <Play wh={20} />
              </Button>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                <SpinerLoader />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 relative">
            <div 
              ref={waveformRef} 
              className="w-full" 
              style={{ width: "100%", height: "24px" }}
            />
            {wavesurfer.current && (
              <div className="absolute top-6 right-0 text-xs text-gray-500 font-mono">
                {remainingTime()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AudioPlayer;
