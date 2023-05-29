import labels from "../labels.json";
import { Colors } from "../utils";

/**
 * Render prediction boxes
 * @param {Expo2DContext} ctx Expo context
 * @param {number} threshold threshold number
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 * @param {Array[Number]} ratios boxes ratio [xRatio, yRatio]
 */
export const renderBoxes = async (
  ctx,
  threshold,
  boxes_data,
  scores_data,
  classes_data,
  ratios,
  flipX = true
) => {
  ctx.clearRect(0, 0, ctx.width, ctx.height); // clean canvas

  // font configs
  const font = `${Math.max(Math.round(Math.max(ctx.width, ctx.height) / 40), 14)}pt sans-serif`;
  ctx.font = font;
  ctx.textBaseline = "top";

  const colors = new Colors();

  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > threshold) {
      const klass = labels[classes_data[i]];
      const color = colors.get(classes_data[i]);
      const score = (scores_data[i] * 100).toFixed(1);

      let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
      x1 *= ctx.width * ratios[0];
      x2 *= ctx.width * ratios[0];
      y1 *= ctx.height * ratios[1];
      y2 *= ctx.height * ratios[1];
      const width = x2 - x1;
      const height = y2 - y1;

      // flip horizontal
      let x;
      if (flipX) x = ctx.width - x1 - width;
      else x = x1;

      // Draw the bounding box.
      // strokeRect not rendering!
      ctx.fillStyle = Colors.hexToRgba(color, 0.2);
      ctx.fillRect(x, y1, width, height);

      // Draw the label background.
      ctx.fillStyle = color;
      const textWidth = ctx.measureText(klass + " - " + score + "%").width;
      const textHeight = parseInt(font, 10); // base 10
      const yText = y1 - (textHeight + 2);
      ctx.fillRect(x - 1, yText < 0 ? 0 : yText, textWidth + 2, textHeight + 2);

      // Draw labels
      ctx.fillStyle = "#ffffff";
      ctx.fillText(klass + " - " + score + "%", x - 1, yText < 0 ? 0 : yText);
    }
  }
  ctx.flush();
};
