import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Video, FolderOpen, Loader2, PlayCircle, ChevronLeft } from 'lucide-react';
import { globalPoseLandmarker, modelReady } from '../utils/mediapipe';

// 対象校リスト
const ELEMENTARY_SCHOOLS = [
  '北小学校', '南小学校', '城東小学校', '今井小学校', '東小学校',
  '西小学校', '羽黒小学校', '楽田小学校', '池野小学校', '栗栖小学校',
];
const JUNIOR_SCHOOLS = [
  '犬山中学校', '城東中学校', '東部中学校', '南部中学校',
];

export default function VideoEvaluation() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);       // 既存動画選択用
  const captureInputRef = useRef(null);    // その場で撮影用

  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(modelReady);

  // モデル読み込み状態を監視
  useEffect(() => {
    if (modelReady) { setModelLoaded(true); return; }
    const id = setInterval(() => {
      if (modelReady) { setModelLoaded(true); clearInterval(id); }
    }, 500);
    return () => clearInterval(id);
  }, []);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    video.src = url;
    video.onloadedmetadata = () => setVideoReady(video.videoWidth > 0);
  }

  async function startAnalysis() {
    if (!modelLoaded || !videoReady || isAnalyzing) return;
    if (!school) { alert('学校を選択してください'); return; }
    if (!className.trim()) { alert('クラスを入力してください'); return; }
    if (!studentNum.trim()) { alert('出席番号を入力してください'); return; }

    setIsAnalyzing(true);
    const video = videoRef.current;
    video.currentTime = 0;
    await video.play();

    // ============================================================
    // 解析ロジック（仕様書§3 完全準拠・変更禁止）
    // ============================================================
    const bpmValues = [];
    const tiltValues = [];
    let compressions = 0;
    let smoothedY = null;
    let lastSmoothedY = null;
    let isMovingDown = false;
    let lastCompressionTime = null;
    let isAborted = false;

    await new Promise((resolve) => {
      function predictLoop() {
        if (video.paused || video.ended) { resolve(); return; }

        const videoTime = video.currentTime;

        // ① 除外区間（仕様書準拠）
        if (videoTime < 3 || videoTime > video.duration - 3) {
          requestAnimationFrame(predictLoop);
          return;
        }

        let result;
        try {
          result = globalPoseLandmarker.detectForVideo(video, performance.now());
        } catch {
          isAborted = true;
          resolve();
          return;
        }

        if (result.landmarks?.length > 0) {
          const landmarks = result.landmarks[0];

          // ② ランドマーク選択（visibility が高い側を自動採用）
          const wrist =
            landmarks[15].visibility > landmarks[16].visibility
              ? landmarks[15]
              : landmarks[16];
          const shoulder =
            landmarks[11].visibility > landmarks[12].visibility
              ? landmarks[11]
              : landmarks[12];

          // ③ EMA スムージング（仕様書準拠: α=0.4）
          if (smoothedY === null) smoothedY = wrist.y;
          const newSmoothedY = 0.4 * wrist.y + 0.6 * smoothedY;
          const diff = lastSmoothedY !== null ? newSmoothedY - lastSmoothedY : 0;
          lastSmoothedY = newSmoothedY;
          smoothedY = newSmoothedY;

          // ④ 圧迫検知（仕様書準拠）
          if (diff > 0.003) isMovingDown = true;
          if (isMovingDown && diff < -0.001) {
            compressions++;
            const now = performance.now();
            if (lastCompressionTime !== null) {
              const interval = now - lastCompressionTime;
              if (interval > 400) {
                bpmValues.push(60000 / interval); // 150BPM 超は除外
              }
            }
            lastCompressionTime = performance.now();
            isMovingDown = false;
          }

          // ⑤ 傾き算出（仕様書準拠）
          const dx = wrist.x - shoulder.x;
          const dy = wrist.y - shoulder.y;
          tiltValues.push(Math.abs(Math.atan2(dx, dy) * 180 / Math.PI));
        }

        requestAnimationFrame(predictLoop);
      }

      video.onended = resolve;
      video.onerror = () => { isAborted = true; resolve(); };
      requestAnimationFrame(predictLoop);
    });
    // ============================================================

    video.pause();
    const schoolType = JUNIOR_SCHOOLS.includes(school) ? 'junior' : 'elementary';
    navigate('/result', {
      state: { bpmValues, tiltValues, compressions, isAborted, school, className, studentNum, schoolType },
    });
  }

  const canStart = modelLoaded && videoReady && !isAnalyzing;

  return (
    <div className="page evaluate-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ChevronLeft size={20} /> ホームへ戻る
      </button>

      <h2 className="page-title">ビデオで評価する</h2>

      {/* 撮影ガイダンス */}
      <div className="guidance-box">
        <p className="guidance-title">📷 撮影方法</p>
        <p>カメラに対して<strong>横向き</strong>で胸骨圧迫を行ってください。</p>
        <p>腕・肩がよく見える角度で撮影すると精度が上がります。</p>
      </div>

      {/* 学校・クラス入力 */}
      <div className="form-group">
        <label>学校を選択</label>
        <select value={school} onChange={(e) => setSchool(e.target.value)}>
          <option value="">学校を選択</option>
          <optgroup label="小学校">
            {ELEMENTARY_SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="中学校">
            {JUNIOR_SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>

      <div className="form-group">
        <label>クラスを入力</label>
        <input
          type="text"
          placeholder={
            JUNIOR_SCHOOLS.includes(school)
              ? '例: 2年1組'
              : '例: 5年1組'
          }
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>出席番号</label>
        <input
          type="number"
          min="1"
          max="40"
          placeholder="例: 12"
          value={studentNum}
          onChange={(e) => setStudentNum(e.target.value)}
        />
      </div>

      {/* 動画選択 */}
      <div className="video-area">
        <div className="video-wrapper">
          <video ref={videoRef} playsInline muted className="video-player" />

          {/* 安全装置オーバーレイ（仕様書§2.3 準拠） */}
          {(!modelLoaded || (videoRef.current && videoRef.current.src && !videoReady)) && (
            <div className="overlay">
              <Loader2 size={32} className="spin" />
              <span>AIモデルを準備中...</span>
            </div>
          )}
        </div>

        <div className="file-buttons">
          <button
            className="btn-file"
            onClick={() => captureInputRef.current?.click()}
          >
            <Video size={20} />
            その場で撮影する
          </button>
          <button
            className="btn-file"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen size={20} />
            撮影済み動画を選ぶ
          </button>
        </div>

        {/* その場で撮影 */}
        <input
          ref={captureInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {/* 既存動画を選択 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* 解析開始ボタン */}
      <motion.button
        className={`btn btn-primary ${!canStart ? 'disabled' : ''}`}
        whileTap={canStart ? { scale: 0.97 } : {}}
        onClick={startAnalysis}
        disabled={!canStart}
      >
        {isAnalyzing ? (
          <><Loader2 size={20} className="spin" /> 解析中...</>
        ) : (
          <><PlayCircle size={20} /> 解析を開始する</>
        )}
      </motion.button>
    </div>
  );
}
