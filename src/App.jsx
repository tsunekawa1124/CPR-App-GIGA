import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Home from './pages/Home';
import VideoEvaluation from './pages/VideoEvaluation';
import Result from './pages/Result';
import Ranking from './pages/Ranking';

// モジュールスコープでモデルを保持（コンポーネント跨ぎでアクセス）
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

export default function App() {
  useEffect(() => {
    // アプリ起動時にバックグラウンドでモデルをプリロード
    loadModel().catch(console.error);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evaluate" element={<VideoEvaluation />} />
        <Route path="/result" element={<Result />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </HashRouter>
  );
}
