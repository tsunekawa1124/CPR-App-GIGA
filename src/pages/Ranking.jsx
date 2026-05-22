import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Loader2, ChevronLeft, School } from 'lucide-react';
import { fetchRanking } from '../utils/gas';

const TABS = [
  { key: 'elementary', label: '小学校' },
  { key: 'junior', label: '中学校' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Ranking() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('elementary');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const schoolRanking = data?.schoolRanking?.filter((s) => s.schoolType === tab) ?? [];
  const classRanking = data?.classRanking?.filter((c) => c.schoolType === tab) ?? [];

  return (
    <div className="page ranking-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ChevronLeft size={20} /> ホームへ戻る
      </button>

      <div className="ranking-header">
        <Trophy size={32} color="#f39c12" />
        <h2 className="page-title">ランキング</h2>
      </div>

      {/* タブ切り替え */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center">
          <Loader2 size={36} className="spin" />
          <p>ランキング取得中...</p>
        </div>
      ) : !data ? (
        <p className="error-msg">ランキングを取得できませんでした。</p>
      ) : (
        <>
          {/* 学校ランキング */}
          <section className="ranking-section">
            <h3 className="section-title">
              <School size={18} /> 学校ランキング（貢献度）
            </h3>
            <p className="section-note">参加人数 × 平均スコアで競います</p>
            {schoolRanking.length === 0 ? (
              <p className="empty-msg">まだデータがありません</p>
            ) : (
              <div className="ranking-list">
                {schoolRanking.map((item, i) => (
                  <motion.div
                    key={item.school}
                    className={`ranking-row ${i < 3 ? 'top' : ''}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="rank-pos">
                      {i < 3 ? MEDAL[i] : `${i + 1}位`}
                    </span>
                    <span className="school-name">{item.school}</span>
                    <span className="stat">参加 {item.count}名</span>
                    <span className="stat avg">{Math.round(item.avg)}点</span>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* クラスランキング */}
          <section className="ranking-section">
            <h3 className="section-title">
              <Trophy size={18} /> クラスランキング（平均点）
            </h3>
            {classRanking.length === 0 ? (
              <p className="empty-msg">まだデータがありません</p>
            ) : (
              <div className="ranking-list">
                {classRanking.slice(0, 10).map((item, i) => (
                  <motion.div
                    key={`${item.school}-${item.cls}`}
                    className={`ranking-row ${i < 3 ? 'top' : ''}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="rank-pos">
                      {i < 3 ? MEDAL[i] : `${i + 1}位`}
                    </span>
                    <span className="school-name">
                      {item.school} {item.cls}
                    </span>
                    <span className="stat">{item.count}名</span>
                    <span className="stat avg">{Math.round(item.avg)}点</span>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
