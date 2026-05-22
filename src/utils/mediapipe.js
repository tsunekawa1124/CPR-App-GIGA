// =============================================
// MediaPipe グローバル状態管理
// App.jsx / VideoEvaluation.jsx 両方から参照
// =============================================
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export let globalPoseLandmarker = null;
export let modelReady = false;

export async function loadModel() {
  if (modelReady) return;
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  globalPoseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
  modelReady = true;
}
