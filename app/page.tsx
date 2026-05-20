import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-amber-50">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🕰️</div>
        <h1 className="text-5xl font-bold text-amber-800 mb-3">タイムライン</h1>
        <p className="text-stone-600 mb-10 text-lg">
          歴史的な出来事を正しい順番に並べよう
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/game"
            className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors shadow-lg"
          >
            ゲームを始める
          </Link>
          <Link
            href="/admin"
            className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-3 px-8 rounded-xl text-base transition-colors border border-stone-300"
          >
            イベント管理
          </Link>
        </div>

        <p className="mt-10 text-stone-400 text-sm">
          2〜4人でプレイ。歴史カードを正しい位置に置いてポイントを獲得しよう。
        </p>
        <p className="mt-4 text-stone-400 text-xs">
          追加してほしい出来事や、バグがあれば{' '}
          <a href="mailto:ss15n01ryusei63@outlook.com" className="underline hover:text-stone-600">
            ss15n01ryusei63@outlook.com
          </a>{' '}
          まで連絡してください。
        </p>
      </div>
    </main>
  );
}
