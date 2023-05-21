import { useState, useEffect, useRef } from "react";
import Play from "../svg/Play";
import WaveSurfer from "wavesurfer.js";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import { IoIosPause } from "react-icons/io";

import "./styles/AudioPlayer.css";
import SpinerLoader from "../SpinerLoader";

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
        waveColor: "#8da78f",
        progressColor: "#00a884",
        cursorColor: "#00a884",
        hideScrollbar: true,
        cursorWidth: 2,
        scrollParent: false,
        responsive: true,
        height: !isPreview ? 24 : 35,
        maxCanvasWidth: 250,
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
        <div className="preview-audio">
          {isPlaying && isAudioLoaded ? (
            <button
              onClick={handelPausePlay}
              aria-label="Pause"
              style={{ fontSize: "22px" }}
            >
              <IoIosPause />
            </button>
          ) : (
            <button onClick={handelPausePlay} aria-label="Play">
              <Play wh={16} />
            </button>
          )}
          <div
            ref={waveformRef}
            className="wafe"
            style={{ width: "100%" }}
          ></div>
          {wavesurfer.current && <p>{remainingTime()}</p>}
        </div>
      ) : (
        <div className="audio-message">
          <div className="avatar">
            <img src={avatar ? avatar : defaultAvatar} alt="avatar" className="avatar" />
          </div>
          <div className="controle">
            {isPlaying && isAudioLoaded ? (
              <button
                onClick={handelPausePlay}
                aria-label="Pause"
                style={{ fontSize: "28px" }}
                className="pause d-f"
              >
                <IoIosPause />
              </button>
            ) : isAudioLoaded && (
              <button onClick={handelPausePlay} aria-label="Play" className="play d-f">
                <Play wh={20} />
              </button>
            )}
            {
              !isAudioLoaded && <SpinerLoader />
            }
          </div>
          <div className="wave-time">
            <div ref={waveformRef} className="wafe" style={{ width: "100%" , height: '100%' }}>
              {wavesurfer.current && <p>{remainingTime()}</p>}
            </div>
          </div>
        </div>
        
      )}
    </>
  );
};

export default AudioPlayer;
