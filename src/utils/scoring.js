// =============================================
// 減点方式採点ロジック
// 解析ロジック（仕様書§3）とは完全分離
// =============================================

/**
 * BPM 減点（最大 50点）
 * 100〜120 BPM を外れた圧迫 1回につき -1点
 */
function calcBpmDeduction(bpmValues) {
  const outOfRange = bpmValues.filter((bpm) => bpm < 100 || bpm > 120).length;
  return Math.min(outOfRange, 50);
}

/**
 * 傾き減点（最大 50点）
 * 20° 超のフレーム割合に応じた段階減点
 *
 * 0%        → 0点
 * 1〜 5%   → −10点
 * 6〜15%   → −20点
 * 16〜30%  → −30点
 * 31〜50%  → −40点
 * 51%以上  → −50点
 */
function calcTiltDeduction(tiltValues) {
  if (!tiltValues.length) return 0;
  const badCount = tiltValues.filter((t) => t > 20).length;
  const rate = badCount / tiltValues.length;

  if (rate === 0)    return 0;
  if (rate <= 0.05)  return 10;
  if (rate <= 0.15)  return 20;
  if (rate <= 0.30)  return 30;
  if (rate <= 0.50)  return 40;
  return 50;
}

/**
 * ランク判定
 */
function calcRank(score) {
  if (score >= 90) return { label: '◎', name: 'エキスパート級', tier: 'S' };
  if (score >= 70) return { label: '○', name: 'スタンダード級', tier: 'A' };
  if (score >= 50) return { label: '△', name: 'あと一歩！', tier: 'B' };
  return { label: '×', name: '要練習', tier: 'C' };
}

/**
 * アドバイス生成（仕様書§4.3 準拠）
 */
function calcAdvice(bpmDeduction, tiltDeduction) {
  const advice = [];
  if (bpmDeduction > 0) {
    advice.push(
      '1分間に100〜120回の一定のリズムに達していません。テンポを合わせる練習をしましょう。'
    );
  }
  if (tiltDeduction > 0) {
    advice.push(
      '腕が少し斜めになっています。肩の真下に手を置き、真上から真っ直ぐに体重を乗せて押すことを意識しましょう。'
    );
  }
  return advice;
}

/**
 * 中央値を計算
 */
function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * メイン採点関数
 * @param {number[]} bpmValues  - 各圧迫の瞬間BPM配列（仕様書§3.3）
 * @param {number[]} tiltValues - 各フレームの傾き角配列（仕様書§3.2）
 * @returns {object} 採点結果
 */
export function calcScore(bpmValues, tiltValues) {
  const bpmDeduction = calcBpmDeduction(bpmValues);
  const tiltDeduction = calcTiltDeduction(tiltValues);
  const score = Math.max(0, 100 - bpmDeduction - tiltDeduction);
  const rank = calcRank(score);
  const advice = calcAdvice(bpmDeduction, tiltDeduction);
  const medianBpm = Math.round(median(bpmValues));
  const medianTilt = Math.round(median(tiltValues) * 10) / 10;
  const bpmOutOfRange = bpmValues.filter((b) => b < 100 || b > 120).length;
  const badFrameRate =
    tiltValues.length
      ? Math.round((tiltValues.filter((t) => t > 20).length / tiltValues.length) * 1000) / 1000
      : 0;

  return {
    score,
    bpmDeduction,
    tiltDeduction,
    rank,
    advice,
    medianBpm,
    medianTilt,
    bpmOutOfRange,
    badFrameRate,
  };
}
