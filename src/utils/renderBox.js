import labels from "./labels.json";

/**
 * Render prediction boxes
 * @param {Expo2DContext} ctx Expo context
 * @param {number} threshold threshold number
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 */
export const renderBoxes = async (
  ctx,
  threshold,
  boxes_data,
  scores_data,
  classes_data,
  flipX = true
) => {
  ctx.clearRect(0, 0, ctx.width, ctx.height); // clean canvas
  const font = "40pt sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";
  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > threshold) {
      const klass = labels[classes_data[i]];
      const score = (scores_data[i] * 100).toFixed(1);

      let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= ctx.width;
      x2 *= ctx.width;
      y1 *= ctx.height;
      y2 *= ctx.height;
      const width = x2 - x1;
      const height = y2 - y1;

      // flip horizontal
      let x;
      if (flipX) x = ctx.width - x1 - width;
      else x = x1;

      // Draw the bounding box.
      // strokeRect not rendering!
      ctx.fillStyle = "rgba(0,255,0,0.2)";
      ctx.fillRect(x, y1, width, height);

      // Draw the label background.
      ctx.fillStyle = "rgb(0,255,0)";
      const textWidth = ctx.measureText(klass + " - " + score + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

      // Draw labels
      ctx.fillStyle = "#ffffff";
      ctx.fillText(klass + " - " + score + "%", x - 1, y1 - (textHeight + 2));
    }
  }
  ctx.flush();
};
