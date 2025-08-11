import { useState, useEffect } from 'react';
import { useAudioRecorder } from "react-audio-voice-recorder";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase";
import useUser from "../store/useUser";

export const useAudio = () => {
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioDetails, setAudioDetails] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const {
    startRecording,
    stopRecording,
    recordingTime,
    recordingBlob,
    isRecording,
    isPaused,
    togglePauseResume,
  } = useAudioRecorder();

  const getCurrentUser = useUser((state) => state.getCurrentUser);

  useEffect(() => {
    if (!recordingBlob) return;
    const audioURL = URL.createObjectURL(recordingBlob);
    setAudioDetails(audioURL);
  }, [recordingBlob]);

  useEffect(() => {
    if (recordingTime > 0) setAudioDuration(recordingTime);
  }, [recordingTime]);

  const startAudioRecording = () => {
    setIsAudioRecording(true);
    startRecording();
    setAudioDetails(null);
  };

  const stopAudioRecording = () => {
    setAudioDetails(null);
    stopRecording();
    setIsAudioRecording(false);
  };

  const uploadAudio = (blob, blobName) => {
    return new Promise((resolve, reject) => {
      const audioname = new Date().getTime() + blobName;
      const storageRef = ref(
        storage,
        `audio/${getCurrentUser().uid}/${audioname}`
      );
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.log(error.message);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const fullPath = uploadTask.snapshot.ref.fullPath;
            resolve({ downloadURL, fullPath });
          });
        }
      );
    });
  };

  const formatTimeAudioRecording = (sec) => {
    const minut = Math.floor(sec / 60);
    const second = Math.floor(sec % 60);
    const secondValue = second < 10 ? `0${second}` : second;
    return `${minut}:${secondValue}`;
  };

  return {
    isAudioRecording,
    audioDetails,
    audioDuration,
    isRecording,
    isPaused,
    recordingTime,
    recordingBlob,
    startAudioRecording,
    stopAudioRecording,
    togglePauseResume,
    uploadAudio,
    formatTimeAudioRecording,
  };
};
