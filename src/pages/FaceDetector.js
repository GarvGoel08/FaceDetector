import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FaceDetector = () => {
  const webcamRef = useRef(null);
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(false);
  const [currentLoc, setCurrentLoc] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [lookDuration, setLookDuration] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to load models:', error);
        setNotification({ message: 'Failed to load models. Please check the console for errors.', type: 'error' });
      }
    };

    const detectFace = async () => {
      if (!modelsLoaded || !webcamRef.current || !webcamRef.current.video) {
        return;
      }
    
      const video = webcamRef.current.video;
    
      const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      if (result) {
        const landmarks = result.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
    
        const avgEyeX = (leftEye.map(pt => pt._x).reduce((a, b) => a + b, 0) / leftEye.length + rightEye.map(pt => pt._x).reduce((a, b) => a + b, 0) / rightEye.length) / 2;
        const avgEyeY = (leftEye.map(pt => pt._y).reduce((a, b) => a + b, 0) / leftEye.length + rightEye.map(pt => pt._y).reduce((a, b) => a + b, 0) / rightEye.length) / 2;
    
        const canvasCenterX = video.videoWidth / 2;
        const canvasCenterY = video.videoHeight / 2;
    
        setCurrentLoc(`X: ${Math.abs(avgEyeX - canvasCenterX)} Y: ${Math.abs(avgEyeY - canvasCenterY)}`);
    
        const isLooking = Math.abs(avgEyeX - canvasCenterX) < 50 && Math.abs(avgEyeY - canvasCenterY) < 100;
        setIsLookingAtCamera(isLooking);
    
        if (isLooking) {
          setLookDuration(prevDuration => prevDuration + 1);
        } else {
          setLookDuration(0);
        }
      } else {
        setIsLookingAtCamera(false);
        setLookDuration(0);
      }
    };

    loadModels().then(() => {
      const intervalId = setInterval(detectFace, 1000); 

      return () => {
        clearInterval(intervalId); 
      };
    });
  }, [modelsLoaded]);

  useEffect(() => {
    if (lookDuration >= 10) {
      window.location.href = '/Home';
    }
  }, [lookDuration]);

  return (
    <div className="container">
      <div className="webcam-container">
        <Webcam ref={webcamRef} />
      </div>
      {modelsLoaded ? (
        <>
          {isLookingAtCamera ? <p className="success">You are looking at the camera <br/> Please keep looking for {10-lookDuration}</p> : <p className="error">You are not looking at the camera</p>}
        </>
      ) : (
        <div className="Load">Please wait while the models get loaded.</div>
      )}
    </div>
  );
};

export default FaceDetector;
