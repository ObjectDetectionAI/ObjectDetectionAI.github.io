"use client";

import React, {useEffect, useRef, useState} from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {load as cocoSSDLoad} from "@tensorflow-models/coco-ssd";
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
        await tf.ready();
        const backendSet = await tf.setBackend("webgl");
        if (!backendSet) {
          console.warn("WebGL backend unavailable, falling back to CPU.");
          await tf.setBackend("cpu");
        }
        await tf.ready();

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

    return () => {
      if (detectInterval) {
        clearInterval(detectInterval);
      }
    };
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
    <div className="mt-8 w-full max-w-6xl">
      {isLoading ? (
        <div className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md text-slate-700 font-semibold text-center">
          Loading AI Model...
        </div>
      ) : (
        <div className="relative flex justify-center items-center rounded-[32px] bg-white/90 p-1.5 shadow-2xl ring-1 ring-slate-200">
          <Webcam
            ref={webcamRef}
            className="rounded-[30px] w-full lg:h-[720px]"
            muted
            videoConstraints={videoConstraints}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-10 w-full lg:h-[720px] rounded-[30px]"
          />
          <button
            onClick={switchCamera}
            className="absolute top-5 right-5 z-20 rounded-full bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Switch Camera
          </button>
          {isOffline && (
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-amber-500/95 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg">
              The application is currently offline. Some features may not be available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
