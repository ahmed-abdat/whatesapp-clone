import { useState, useEffect, useRef } from "react";
import Play from "../svg/Play";
import WaveSurfer from "wavesurfer.js";
import Pause from "../svg/Pause";
import {IoIosPause} from 'react-icons/io'

import "./styles/AudioPlayer.css";

const AudioPlayer = ({ audioSrc }) => {

  const [isPlaying , setIsPlaying] = useState(false)
  const [duratione , setDuration] = useState(0)
  const [currentTime , setCurrentTime] = useState(0)

  const waveformRef = useRef();
  const wavesurfer = useRef(null);

  useEffect(() => {
    if(waveformRef.current) {
      wavesurfer.current =  WaveSurfer.create({
        container: waveformRef.current,
        autoCenter: true,
        waveColor : '#8da78f',
        progressColor : '#6f8171',
        hideScrollbar : true,
        backgfloorColor : '#fff',
        cursorColor : '#6f8171',
        cursorWidth : 2,
        scrollParent : false,
        responsive : true,
        height : 35,
        maxCanvasWidth : 300,
        barWidth: 3,
        barRadius: 3,
        barMinHeight : 1
        
      });
      wavesurfer.current.load(audioSrc);
      
    }
    wavesurfer.current.on("finish" , () => {
      setIsPlaying(false)
      wavesurfer.current.stop()
    })




    wavesurfer.current.on("ready" , () => {
      setDuration(wavesurfer.current.getDuration())
    })
    wavesurfer.current.on("audioprocess" , () => {
      setCurrentTime(wavesurfer.current.getCurrentTime())
    })


  }, []);
  

const handelPausePlay = () => {
  wavesurfer.current.playPause()
  setIsPlaying(wavesurfer.current?.isPlaying())
}

  const formatTimeAudioRecording = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    const secondValue = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${secondValue}`;
  };

  const remainingTime = () => {
    const finalTime = currentTime === 0 ? duratione : currentTime
    return formatTimeAudioRecording(finalTime)
  }




  return (
    <div className="audio-player">
        {isPlaying ? (
          <button onClick={handelPausePlay} aria-label="Pause" style={{ fontSize : '23px'}}>
        <IoIosPause  />
      </button>
    ) : (
      <button onClick={handelPausePlay} aria-label="Play">
        <Play wh={18} />
      </button>
    )}
    <div ref={waveformRef} className="wafe" style={{width : '100%'}}></div>
     {
      wavesurfer.current &&  <p>
      {remainingTime()}
    </p>
     }
    </div>
  );
};

export default AudioPlayer;
