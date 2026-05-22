// =============================================
// MediaPipe グローバル状態管理
// =============================================

export let globalPoseLandmarker = null;
export let modelReady = false;

export async function loadModel() {
  if (modelReady) return;
  try {
    // 動的インポートでバンドル時エラーを回避
    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
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
    console.log('[MediaPipe] モデル読み込み完了');
  } catch (e) {
    console.error('[MediaPipe] モデル読み込み失敗:', e);
  }
}
