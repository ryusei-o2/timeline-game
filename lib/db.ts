import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'timeline.db');

// Singleton: reuse DB across Next.js module re-evaluations
declare global {
  // eslint-disable-next-line no-var
  var _timelineDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // UNIQUE on (title, year) prevents duplicate seeds regardless of how many times this runs
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(title, year)
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };

  if (countRow.count === 0) {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO events (title, year, description) VALUES (?, ?, ?)'
    );

    const seed: [string, number, string][] = [
      ['ピラミッド建設（クフ王）', -2560, '古代エジプト、ギザの大ピラミッドが建設された'],
      ['ソクラテスの死', -399, 'ギリシャの哲学者ソクラテスが毒杯を飲み死亡した'],
      ['ユリウス・カエサル暗殺', -44, 'ローマの将軍カエサルが元老院議員たちに暗殺された'],
      ['大化の改新', 645, '中大兄皇子が蘇我氏を倒し、中央集権国家の基礎を築いた改革'],
      ['平安京遷都', 794, '桓武天皇が京都（平安京）に都を移した'],
      ['源平合戦（壇ノ浦の戦い）', 1185, '源義経が率いる軍が平家を壇ノ浦で滅ぼした'],
      ['鎌倉幕府成立', 1192, '源頼朝が征夷大将軍に任命され、鎌倉幕府を開いた'],
      ['元寇（文永の役）', 1274, 'モンゴル帝国が日本に初めて侵攻した'],
      ['コロンブスのアメリカ大陸到達', 1492, 'クリストファー・コロンブスがカリブ海の島に到達した'],
      ['ザビエル来日', 1549, 'フランシスコ・ザビエルがキリスト教を日本に伝えた'],
      ['桶狭間の戦い', 1560, '織田信長が今川義元を奇襲で破った'],
      ['本能寺の変', 1582, '明智光秀が織田信長を本能寺で討った'],
      ['関ヶ原の戦い', 1600, '徳川家康が石田三成らを破り、天下統一への道を開いた'],
      ['江戸幕府成立', 1603, '徳川家康が征夷大将軍となり江戸幕府を開いた'],
      ['鎖国令', 1639, '徳川幕府がポルトガル船の来航を禁止し、鎖国体制を確立した'],
      ['フランス革命', 1789, 'フランスで市民が王政を打倒し、共和国を目指した革命'],
      ['ナポレオン皇帝即位', 1804, 'ナポレオン・ボナパルトがフランス皇帝に即位した'],
      ['ペリー来航', 1853, 'マシュー・ペリーが黒船4隻を率いて浦賀に来航した'],
      ['アメリカ南北戦争終結', 1865, '奴隷制廃止をめぐるアメリカの内戦が北軍の勝利で終わった'],
      ['明治維新', 1868, '明治天皇が即位し、近代日本への改革が始まった'],
      ['西南戦争', 1877, '西郷隆盛が率いる士族が政府軍に敗れた内乱'],
      ['日清戦争', 1894, '日本と清（中国）の間で朝鮮半島の支配をめぐって起きた戦争'],
      ['日露戦争', 1904, '日本とロシアが満州・朝鮮の支配をめぐって戦った'],
      ['第一次世界大戦勃発', 1914, 'サラエボ事件をきっかけに第一次世界大戦が始まった'],
      ['関東大震災', 1923, '関東地方を襲ったマグニチュード7.9の大地震'],
      ['太平洋戦争開戦', 1941, '日本が真珠湾を攻撃し、太平洋戦争が始まった'],
      ['広島への原爆投下', 1945, 'アメリカが広島に世界初の原子爆弾を投下した'],
      ['日本国憲法施行', 1947, '現行の日本国憲法が施行された'],
      ['東京オリンピック', 1964, '日本で最初のオリンピックが開催された'],
      ['月面着陸', 1969, 'アポロ11号が月面に着陸し、人類初の月面歩行が実現した'],
      ['ベルリンの壁崩壊', 1989, '東西ドイツを分断していたベルリンの壁が崩壊した'],
      ['阪神・淡路大震災', 1995, 'マグニチュード7.3の地震が神戸を直撃した'],
      ['東日本大震災', 2011, 'マグニチュード9.0の地震と津波が東北地方を襲った'],
    ];

    const insertAll = db.transaction(() => {
      for (const [title, year, description] of seed) {
        insert.run(title, year, description);
      }
    });
    insertAll();
  }

  return db;
}

const db = global._timelineDb ?? createDb();
global._timelineDb = db;

export default db;
