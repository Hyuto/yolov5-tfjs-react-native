import { Camera, CameraType } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { renderBoxes } from "../utils/renderBox";

const TensorCamera = cameraWithTensors(Camera);

const CameraView = ({ type, model, inputTensorSize, ctx, config }) => {
  const typesMapper = { back: CameraType.back, front: CameraType.front };

  const cameraStream = (images) => {
    const detectFrame = async () => {
      tf.engine().startScope();
      const input = tf.tidy(() => {
        return tf.image
          .resizeBilinear(images.next().value, [inputTensorSize[1], inputTensorSize[2]])
          .div(255.0)
          .expandDims(0);
      });

      await model.executeAsync(input).then((res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();

        renderBoxes(ctx, config.threshold, boxes_data, scores_data, classes_data);
        tf.dispose([res, input]);
      });

      requestAnimationFrame(detectFrame); // get another frame
      tf.engine().endScope();
    };

    detectFrame();
  };

  return (
    <>
      <TensorCamera
        // Standard Camera props
        className="w-full h-full"
        type={typesMapper[type]}
        // Tensor related props
        //use_custom_shaders_to_resize={true}
        resizeHeight={inputTensorSize[1]}
        resizeWidth={inputTensorSize[2]}
        resizeDepth={inputTensorSize[3]}
        onReady={cameraStream}
        autorender={true}
      />
    </>
  );
};

export default CameraView;
