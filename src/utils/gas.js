// =============================================
// GAS（Google Apps Script）API 通信
// GAS_URL は後日デプロイ後に差し替え
// =============================================

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxj1jpRn5666WliBR5fQgggi8ZqezE3c-cczOE6HATsEc03gqb4W3XInv5G2ib3udko/exec'; // デプロイ後に差し替え

/**
 * スコアを GAS に送信（POST）
 */
export async function postScore(payload) {
  if (GAS_URL === 'YOUR_GAS_URL_HERE') {
    console.warn('[GAS] URL 未設定のため送信をスキップしました');
    return;
  }
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[GAS] 送信エラー:', e);
  }
}

/**
 * ランキングデータを GAS から取得（GET）
 * @returns {{ classRanking: Array, schoolRanking: Array } | null}
 */
export async function fetchRanking() {
  if (GAS_URL === 'YOUR_GAS_URL_HERE') {
    console.warn('[GAS] URL 未設定のためダミーデータを返します');
    return getDummyRanking();
  }
  try {
    const res = await fetch(GAS_URL);
    return await res.json();
  } catch (e) {
    console.error('[GAS] 取得エラー:', e);
    return null;
  }
}

/** GAS 未接続時のダミーデータ（開発・デモ用） */
function getDummyRanking() {
  return {
    schoolRanking: [
      { school: '犬山中学校', avg: 84, count: 42, schoolType: 'junior' },
      { school: '城東中学校', avg: 79, count: 38, schoolType: 'junior' },
      { school: '東部中学校', avg: 76, count: 31, schoolType: 'junior' },
      { school: '南部中学校', avg: 72, count: 27, schoolType: 'junior' },
      { school: '北小学校', avg: 80, count: 55, schoolType: 'elementary' },
      { school: '南小学校', avg: 75, count: 50, schoolType: 'elementary' },
      { school: '城東小学校', avg: 73, count: 48, schoolType: 'elementary' },
      { school: '今井小学校', avg: 71, count: 45, schoolType: 'elementary' },
      { school: '東小学校', avg: 69, count: 42, schoolType: 'elementary' },
      { school: '西小学校', avg: 68, count: 40, schoolType: 'elementary' },
      { school: '羽黒小学校', avg: 65, count: 38, schoolType: 'elementary' },
      { school: '楽田小学校', avg: 63, count: 35, schoolType: 'elementary' },
      { school: '池野小学校', avg: 60, count: 30, schoolType: 'elementary' },
      { school: '栗栖小学校', avg: 58, count: 25, schoolType: 'elementary' },
    ],
    classRanking: [
      { school: '犬山中学校', cls: '2年1組', avg: 88, count: 14, schoolType: 'junior' },
      { school: '城東中学校', cls: '2年3組', avg: 85, count: 12, schoolType: 'junior' },
      { school: '犬山中学校', cls: '2年2組', avg: 82, count: 13, schoolType: 'junior' },
      { school: '北小学校', cls: '5年1組', avg: 83, count: 18, schoolType: 'elementary' },
      { school: '北小学校', cls: '5年2組', avg: 78, count: 17, schoolType: 'elementary' },
      { school: '南小学校', cls: '5年1組', avg: 76, count: 16, schoolType: 'elementary' },
    ],
  };
}
