import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Video, ClipboardList, Trophy } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      {/* ヘッダー */}
      <div className="home-header">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          className="heart-icon"
        >
          <Heart size={56} fill="#e74c3c" color="#e74c3c" />
        </motion.div>
        <h1 className="app-title">胸骨圧迫マスター</h1>
        <p className="app-subtitle">CPR Evaluation System</p>
      </div>

      {/* メインボタン群 */}
      <div className="home-buttons">
        <motion.button
          className="btn btn-primary"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/evaluate')}
        >
          <Video size={22} />
          ビデオで評価する
        </motion.button>

        <motion.button
          className="btn btn-secondary"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/ranking')}
        >
          <Trophy size={22} />
          ランキングを見る
        </motion.button>

        <motion.a
          className="btn btn-outline"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ClipboardList size={22} />
          アンケートに回答する
        </motion.a>
      </div>

      {/* 注意書き */}
      <p className="home-note">
        準拠ガイドライン: JRC蘇生ガイドライン 2020
      </p>
    </div>
  );
}
