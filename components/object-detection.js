"use client";

import React, {useEffect, useRef, useState} from "react";
import Webcam from "react-webcam";
import {load as cocoSSDLoad} from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import {renderPredictions} from "@/utils/render-predictions";

let detectInterval;

const ObjectDetection = ({ predictions }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  const [facingMode, setFacingMode] = useState("user"); // Default to front camera

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const videoConstraints = {
    facingMode: facingMode
  };

  async function runCoco() {
    setIsLoading(true); // Set loading state to true when model loading starts
    const net = await cocoSSDLoad({base: 'lite_mobilenet_v2'}); // Load the model
    setIsLoading(false); // Set loading state to false when model loading completes

    detectInterval = setInterval(() => {
      runObjectDetection(net); // will build this next
    }, 10);
  }

  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      // find detected objects
      const detectedObjects = await net.detect(
        webcamRef.current.video,
        undefined,
        0.6
      );

      //   console.log(detectedObjects);

      const context = canvasRef.current.getContext("2d");
      renderPredictions(detectedObjects, canvasRef.current);
    }
  }

  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    const loadModel = async () => {
      try {
        const net = await cocoSSDLoad({base: 'lite_mobilenet_v2'});
        setIsLoading(false);
        detectInterval = setInterval(() => {
          runObjectDetection(net);
        }, 10);
      } catch (error) {
        console.error("Failed to load model", error);
      }
    };

    loadModel();
    showmyVideo();
  }, [facingMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderPredictions(predictions, canvas);
    }
  }, [predictions]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          {/* webcam */}
          <Webcam
            ref={webcamRef}
            className="rounded-md w-full lg:h-[720px]"
            muted
            videoConstraints={videoConstraints}
          />
          {/* canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
          />
          {/* switch camera button */}
          <button 
            onClick={switchCamera} 
            className="absolute top-4 right-4 z-10000 bg-white p-2 rounded-md shadow-lg text-black font-bold"
            style={{ zIndex: 10000 }}
          >
            Switch Camera
          </button>
          {isOffline && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10000 bg-red-500 text-white p-2 rounded-md opacity-90 text-sm font-bold">
              The application is currently offline. Some features may not be available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
