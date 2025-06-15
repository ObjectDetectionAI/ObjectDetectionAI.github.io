import * as tf from '@tensorflow/tfjs';
import { throttle } from 'lodash';

export function renderPredictions(predictions, canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error('Invalid canvas element');
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Fonts
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];

    const isPerson = prediction.class === "person";

    // bounding box
    ctx.strokeStyle = isPerson ? "#FF0000" : "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // fill the color
    ctx.fillStyle = `rgba(255, 0, 0, ${isPerson ? 0.2 : 0})`; // Set the fill color to red
    ctx.fillRect(x, y, width, height);

    // Draw the label background.
    ctx.fillStyle = isPerson ? "#FF0000" : "#00FFFF";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);

    if (isPerson) {
      playAudio();
    }
  });
};

let isAudioPlaying = false;

const playAudio = throttle(() => {
  if (!isAudioPlaying) {
    const audio = new Audio("/Merry Christmas, Filthy Animal Sound.mp3");
    isAudioPlaying = true;
    audio.play();
    audio.onended = () => {
      isAudioPlaying = false;
    };
  }
}, 2000);
