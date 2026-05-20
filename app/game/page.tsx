'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type Player = { name: string; score: number };
type Card = { id: number; title: string; year?: number };

type GamePhase = 'setup' | 'turn-start' | 'placing' | 'judging' | 'result' | 'gameover';

type JudgeResult = { correct: boolean; year: number; title: string };

function formatYear(year: number) {
  return year < 0 ? `紀元前${Math.abs(year)}年` : `${year}年`;
}

// --- Setup Screen ---
function SetupScreen({
  onStart,
}: {
  onStart: (players: Player[], winScore: number, initialCards: number) => void;
}) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState(['プレイヤー1', 'プレイヤー2', 'プレイヤー3', 'プレイヤー4']);
  const [winScore, setWinScore] = useState(5);
  const [initialCards, setInitialCards] = useState(1);

  function handleStart() {
    const players = names.slice(0, count).map((name, i) => ({
      name: name.trim() || `プレイヤー${i + 1}`,
      score: 0,
    }));
    onStart(players, winScore, initialCards);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-amber-700 hover:text-amber-600 text-xl">←</Link>
          <h1 className="text-2xl font-bold text-amber-800">🕰️ ゲーム設定</h1>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-stone-600 mb-2">プレイヤー人数</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                  count === n
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-stone-600 mb-2">プレイヤー名</label>
          <div className="flex flex-col gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <input
                key={i}
                type="text"
                value={names[i]}
                onChange={(e) => {
                  const next = [...names];
                  next[i] = e.target.value;
                  setNames(next);
                }}
                placeholder={`プレイヤー${i + 1}`}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-stone-600 mb-2">
            勝利条件（先に何ポイント取ったら勝ち）
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={20}
              value={winScore}
              onChange={(e) => setWinScore(Number(e.target.value))}
              className="flex-1 accent-amber-700"
            />
            <span className="font-bold text-amber-700 text-xl w-12 text-right">{winScore}pt</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-stone-600 mb-2">
            初期タイムラインカード数
            <span className="ml-2 text-xs font-normal text-stone-400">（ゲーム開始時に並べる枚数）</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={10}
              value={initialCards}
              onChange={(e) => setInitialCards(Number(e.target.value))}
              className="flex-1 accent-amber-700"
            />
            <span className="font-bold text-amber-700 text-xl w-12 text-right">
              {initialCards}枚
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {initialCards === 0
              ? '最初のカードは必ずどこにでも置けます'
              : `最初から${initialCards}枚が年号付きで並んだ状態で開始します`}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-lg transition-colors shadow"
        >
          ゲームスタート！
        </button>
      </div>
    </div>
  );
}

// --- Score Board ---
function ScoreBoard({
  players,
  currentIndex,
  winScore,
}: {
  players: Player[];
  currentIndex: number;
  winScore: number;
}) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {players.map((p, i) => (
        <div
          key={i}
          className={`px-3 py-2 rounded-lg text-sm font-semibold flex flex-col items-center min-w-20 transition-all ${
            i === currentIndex
              ? 'bg-amber-700 text-white shadow-md scale-105'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          <span className="text-xs opacity-75 truncate max-w-24">{p.name}</span>
          <span className="text-lg font-bold">
            {p.score}
            <span className="text-xs font-normal opacity-75">/{winScore}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Timeline ---
function Timeline({
  cards,
  onInsert,
  enabled,
  selectedPos,
}: {
  cards: Card[];
  onInsert: (pos: number) => void;
  enabled: boolean;
  selectedPos: number | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-0 overflow-x-auto py-4 px-2 scrollbar-hide"
      style={{ minHeight: '110px' }}
    >
      {/* Insert before all */}
      <InsertButton
        pos={0}
        enabled={enabled}
        selected={selectedPos === 0}
        onClick={() => enabled && onInsert(0)}
        isFirst={cards.length === 0}
      />

      {cards.map((card, i) => (
        <div key={card.id} className="flex items-center flex-shrink-0">
          <TimelineCard card={card} />
          <InsertButton
            pos={i + 1}
            enabled={enabled}
            selected={selectedPos === i + 1}
            onClick={() => enabled && onInsert(i + 1)}
          />
        </div>
      ))}
    </div>
  );
}

function InsertButton({
  pos,
  enabled,
  selected,
  onClick,
  isFirst = false,
}: {
  pos: number;
  enabled: boolean;
  selected: boolean;
  onClick: () => void;
  isFirst?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`flex-shrink-0 flex flex-col items-center justify-center transition-all rounded-lg mx-1 ${
        !enabled
          ? 'cursor-default opacity-30'
          : selected
          ? 'bg-amber-500 text-white shadow-lg scale-110'
          : 'bg-amber-100 hover:bg-amber-300 text-amber-700 hover:scale-105'
      }`}
      style={{ width: isFirst ? 80 : 36, height: 72 }}
      title={`ここに置く（位置 ${pos}）`}
    >
      {isFirst ? (
        <span className="text-xs font-bold leading-tight text-center px-1">
          ここに<br />置く
        </span>
      ) : (
        <span className="text-xl font-bold">▼</span>
      )}
    </button>
  );
}

function TimelineCard({ card }: { card: Card }) {
  return (
    <div className="flex-shrink-0 bg-amber-700 text-white rounded-lg shadow-md p-3 flex flex-col items-center gap-1"
      style={{ width: 110, minHeight: 72 }}>
      <span className="text-xs font-bold opacity-75">{formatYear(card.year!)}</span>
      <span className="text-xs text-center leading-tight">{card.title}</span>
    </div>
  );
}

// --- Current Card (hand card, year hidden) ---
function HandCard({ card }: { card: Card }) {
  return (
    <div className="bg-white border-2 border-amber-400 rounded-xl shadow-lg p-4 flex flex-col items-center gap-2 mx-auto"
      style={{ width: 180, minHeight: 100 }}>
      <span className="text-xs text-stone-400 font-semibold">出来事カード</span>
      <span className="text-sm font-bold text-stone-800 text-center leading-snug">{card.title}</span>
      <span className="text-xs text-stone-400">（年号は非表示）</span>
    </div>
  );
}

// --- Main Game Component ---
export default function GamePage() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [winScore, setWinScore] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeline, setTimeline] = useState<Card[]>([]);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStart(ps: Player[], ws: number, initialCards: number) {
    setPlayers(ps);
    setWinScore(ws);
    setCurrentIndex(0);
    setCurrentCard(null);
    setSelectedPos(null);
    setJudgeResult(null);
    setError(null);

    if (initialCards === 0) {
      setTimeline([]);
      setUsedIds([]);
      setPhase('turn-start');
      return;
    }

    // Draw initial cards and reveal their years for the starting timeline
    setIsLoading(true);
    const drawnIds: number[] = [];
    const drawnCards: Card[] = [];

    for (let i = 0; i < initialCards; i++) {
      try {
        const drawRes = await fetch('/api/game/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usedIds: drawnIds }),
        });
        if (!drawRes.ok) break;
        const drawn = await drawRes.json() as { id: number; title: string };

        // Get year by judging against empty timeline (always correct, reveals year)
        const judgeRes = await fetch('/api/game/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: drawn.id, timelineIds: [], position: 0 }),
        });
        const judged = await judgeRes.json() as { year: number; title: string };

        drawnIds.push(drawn.id);
        drawnCards.push({ id: drawn.id, title: drawn.title, year: judged.year });
      } catch {
        break;
      }
    }

    const sorted = drawnCards.sort((a, b) => a.year! - b.year!);
    setTimeline(sorted);
    setUsedIds(drawnIds);
    setIsLoading(false);
    setPhase('turn-start');
  }

  async function handleDrawCard() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/game/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'カードを引けませんでした');
        return;
      }
      const card = await res.json();
      setCurrentCard(card);
      setSelectedPos(null);
      setUsedIds((prev) => [...prev, card.id]);
      setPhase('placing');
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePlaceCard(pos: number) {
    if (!currentCard) return;
    setSelectedPos(pos);

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/game/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          timelineIds: timeline.map((c) => c.id),
          position: pos,
        }),
      });
      const result: JudgeResult = await res.json();
      setJudgeResult(result);
      setPhase('result');

      if (result.correct) {
        const newCard: Card = { ...currentCard, year: result.year };
        const newTimeline = [...timeline];
        newTimeline.splice(pos, 0, newCard);
        newTimeline.sort((a, b) => a.year! - b.year!);
        setTimeline(newTimeline);

        const newPlayers = players.map((p, i) =>
          i === currentIndex ? { ...p, score: p.score + 1 } : p
        );
        setPlayers(newPlayers);

        if (newPlayers[currentIndex].score >= winScore) {
          setPhase('gameover');
        }
      }
    } catch {
      setError('判定に失敗しました');
      setPhase('placing');
    } finally {
      setIsLoading(false);
    }
  }

  function handleNextTurn() {
    const next = (currentIndex + 1) % players.length;
    setCurrentIndex(next);
    setCurrentCard(null);
    setSelectedPos(null);
    setJudgeResult(null);
    setPhase('turn-start');
  }

  function handleRestart() {
    setPhase('setup');
    setPlayers([]);
    setTimeline([]);
    setUsedIds([]);
    setCurrentCard(null);
    setJudgeResult(null);
    setError(null);
  }

  // --- SETUP ---
  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  // --- GAME OVER ---
  if (phase === 'gameover') {
    const winner = players[currentIndex];
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-amber-800 mb-2">{winner.name}</h2>
          <p className="text-stone-600 text-lg mb-6">
            {winner.score}ポイントで勝利！
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-stone-500 mb-3">最終スコア</h3>
            {players
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <div key={p.name} className="flex justify-between items-center py-1">
                  <span className={`text-sm ${i === 0 ? 'font-bold text-amber-700' : 'text-stone-600'}`}>
                    {i === 0 ? '🥇 ' : '　'}{p.name}
                  </span>
                  <span className="font-bold text-stone-700">{p.score}pt</span>
                </div>
              ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              もう一度遊ぶ
            </button>
            <Link href="/" className="text-stone-500 hover:text-stone-700 text-sm">
              トップへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentIndex];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3">
        <ScoreBoard players={players} currentIndex={currentIndex} winScore={winScore} />
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-3xl mx-auto w-full gap-4">

        {/* TURN START */}
        {phase === 'turn-start' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-stone-500 text-sm mb-1">次のプレイヤー</p>
              <h2 className="text-3xl font-bold text-amber-800">{currentPlayer.name}</h2>
              <p className="text-stone-500 text-sm mt-1">
                現在 {currentPlayer.score}pt / 目標 {winScore}pt
              </p>
            </div>
            <p className="text-stone-400 text-sm text-center max-w-xs">
              端末を {currentPlayer.name} さんに渡してください
            </p>
            <button
              onClick={handleDrawCard}
              disabled={isLoading}
              className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors shadow-lg"
            >
              {isLoading ? '引いています...' : 'カードを引く'}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}

        {/* PLACING */}
        {(phase === 'placing' || phase === 'judging') && currentCard && (
          <>
            <div className="text-center">
              <p className="text-amber-700 font-bold">{currentPlayer.name} のターン</p>
              <p className="text-stone-500 text-xs mt-1">
                ▼ を押してカードを置く位置を選んでください
              </p>
            </div>

            <div className="flex justify-center">
              <HandCard card={currentCard} />
            </div>

            <div className="bg-white rounded-xl shadow p-3">
              <p className="text-xs text-stone-400 font-semibold mb-2 text-center">
                タイムライン（{timeline.length}枚配置済み）
              </p>
              <Timeline
                cards={timeline}
                onInsert={handlePlaceCard}
                enabled={phase === 'placing' && !isLoading}
                selectedPos={selectedPos}
              />
            </div>

            {isLoading && (
              <p className="text-center text-stone-400 text-sm">判定中...</p>
            )}
            {error && <p className="text-center text-red-500 text-sm">{error}</p>}
          </>
        )}

        {/* RESULT */}
        {phase === 'result' && judgeResult && currentCard && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className={`rounded-2xl p-6 text-center w-full max-w-sm ${
              judgeResult.correct ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="text-5xl mb-3">{judgeResult.correct ? '✅' : '❌'}</div>
              <h2 className={`text-2xl font-bold mb-1 ${judgeResult.correct ? 'text-green-700' : 'text-red-600'}`}>
                {judgeResult.correct ? '正解！' : '不正解...'}
              </h2>
              <p className="text-stone-700 font-semibold text-lg mb-1">{judgeResult.title}</p>
              <p className="text-stone-500 text-sm">
                正解の年号：<span className="font-bold text-stone-700">{formatYear(judgeResult.year)}</span>
              </p>
              {judgeResult.correct && (
                <p className="text-green-600 font-bold mt-3 text-lg">
                  {currentPlayer.name} +1pt → {players[currentIndex].score}pt
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-3 w-full">
              <p className="text-xs text-stone-400 font-semibold mb-2 text-center">現在のタイムライン</p>
              <Timeline
                cards={timeline}
                onInsert={() => {}}
                enabled={false}
                selectedPos={null}
              />
            </div>

            <button
              onClick={handleNextTurn}
              className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-10 rounded-xl text-base transition-colors shadow"
            >
              次のプレイヤーへ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
