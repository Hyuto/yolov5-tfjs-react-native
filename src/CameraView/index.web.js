import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "../utils/renderBox";

const CameraView = ({ type, model, inputTensorSize, ctx, config }) => {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const typesMapper = { back: "environment", front: "user" };

  /**
   * Function to detect every frame loaded from webcam in video tag.
   * @param {tf.GraphModel} model loaded YOLOv5 tensorflow.js model
   */
  const detectFrame = async () => {
    tf.engine().startScope();
    let [modelWidth, modelHeight] = inputTensorSize.slice(1, 3);
    const input = tf.tidy(() => {
      return tf.image
        .resizeBilinear(tf.browser.fromPixels(videoRef.current), [modelWidth, modelHeight])
        .div(255.0)
        .expandDims(0);
    });

    await model.executeAsync(input).then((res) => {
      const [boxes, scores, classes] = res.slice(0, 3);
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();

      renderBoxes(ctx, config.threshold, boxes_data, scores_data, classes_data, false);
      tf.dispose([res, input]);
    });

    frameRef.current = requestAnimationFrame(detectFrame); // get another frame
    tf.engine().endScope();
  };

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: typesMapper[type],
          },
        })
        .then((stream) => {
          if (videoRef.current.srcObject) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
            videoRef.current.srcObject = null;
            window.localStream.getTracks().forEach((track) => {
              track.stop();
            });
            window.localStream = null;
          }

          window.localStream = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            detectFrame();
          };
        });
    } else alert("Can't open Webcam!");
  }, [type]);

  return (
    <>
      <video className="h-full" autoPlay playsInline muted ref={videoRef} />
    </>
  );
};

export default CameraView;
