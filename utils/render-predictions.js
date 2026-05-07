export function renderPredictions(predictions, canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error('Invalid canvas element');
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const font = "16px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];
    const isPerson = prediction.class === "person";

    ctx.strokeStyle = isPerson ? "#0EA5E9" : "#22C55E";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = isPerson ? "rgba(14, 165, 233, 0.18)" : "rgba(34, 197, 94, 0.14)";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = isPerson ? "#0EA5E9" : "#22C55E";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = 20;
    ctx.fillRect(x, y, textWidth + 10, textHeight + 8);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(prediction.class, x + 4, y + 4);
  });
};
