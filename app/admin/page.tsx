'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Event = {
  id: number;
  title: string;
  year: number;
  description: string | null;
  category: string;
  era: string | null;
};

const CATEGORIES = ['日本史', '西洋史', '世界史'];

const JAPANESE_ERAS = [
  '飛鳥時代', '奈良時代', '平安時代', '鎌倉時代', '室町時代',
  '戦国時代', '安土桃山時代', '江戸時代', '明治時代', '大正時代',
  '昭和時代', '平成時代', '令和時代',
];

const emptyForm = { title: '', year: '', description: '', category: '日本史', era: '' };

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('すべて');

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    const res = await fetch('/api/events');
    setEvents(await res.json());
    setLoading(false);
  }

  function showMsg(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        year: parseInt(form.year),
        description: form.description,
        category: form.category,
        era: form.era || null,
      }),
    });
    if (res.ok) {
      setForm({ ...emptyForm });
      fetchEvents();
      showMsg('出来事を追加しました', 'success');
    } else {
      const err = await res.json();
      showMsg(err.error ?? '追加に失敗しました', 'error');
    }
  }

  function startEdit(ev: Event) {
    setEditingId(ev.id);
    setEditForm({
      title: ev.title,
      year: String(ev.year),
      description: ev.description ?? '',
      category: ev.category,
      era: ev.era ?? '',
    });
  }

  async function handleSave(id: number) {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editForm.title,
        year: parseInt(editForm.year),
        description: editForm.description,
        category: editForm.category,
        era: editForm.era || null,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchEvents();
      showMsg('更新しました', 'success');
    } else {
      const err = await res.json();
      showMsg(err.error ?? '更新に失敗しました', 'error');
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
    showMsg('削除しました', 'success');
  }

  const filtered = events.filter((e) => {
    const matchCat = filterCategory === 'すべて' || e.category === filterCategory;
    const matchSearch =
      e.title.includes(search) ||
      String(e.year).includes(search) ||
      (e.description ?? '').includes(search) ||
      (e.era ?? '').includes(search);
    return matchCat && matchSearch;
  });

  function formatYear(year: number) {
    return year < 0 ? `紀元前${Math.abs(year)}年` : `${year}年`;
  }

  const categoryColor: Record<string, string> = {
    '日本史': 'bg-red-100 text-red-700',
    '西洋史': 'bg-blue-100 text-blue-700',
    '世界史': 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-amber-700 hover:text-amber-600 text-2xl">←</Link>
          <h1 className="text-3xl font-bold text-amber-800">イベント管理</h1>
          <span className="ml-auto text-stone-500 text-sm">{events.length}件登録中</span>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>{message.text}</div>
        )}

        {/* 追加フォーム */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-bold text-lg mb-4 text-stone-700">新しい出来事を追加</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-3 flex-wrap">
              <input
                type="number"
                placeholder="年号（紀元前は -44）"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="border border-stone-300 rounded-lg px-3 py-2 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <input
                type="text"
                placeholder="出来事名（必須）"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border border-stone-300 rounded-lg px-3 py-2 flex-1 min-w-48 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, era: '' })}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {form.category === '日本史' && (
                <select
                  value={form.era}
                  onChange={(e) => setForm({ ...form, era: e.target.value })}
                  className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">時代を選択</option>
                  {JAPANESE_ERAS.map((era) => <option key={era}>{era}</option>)}
                </select>
              )}
            </div>
            <input
              type="text"
              placeholder="説明（任意）"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="self-start bg-amber-700 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              追加
            </button>
          </form>
        </div>

        {/* フィルター・検索 */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-2">
            {['すべて', ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterCategory === c
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-stone-500 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white ml-auto"
          />
        </div>

        {/* 一覧 */}
        {loading ? (
          <p className="text-stone-500 text-center py-12">読み込み中...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 text-amber-900">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold w-28">年号</th>
                  <th className="text-left px-4 py-3 font-semibold">出来事名</th>
                  <th className="text-left px-4 py-3 font-semibold w-24">カテゴリ</th>
                  <th className="text-left px-4 py-3 font-semibold w-28 hidden md:table-cell">時代区分</th>
                  <th className="px-4 py-3 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) =>
                  editingId === ev.id ? (
                    <tr key={ev.id} className="border-t border-stone-100 bg-amber-50">
                      <td className="px-2 py-2">
                        <input type="number" value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                          className="border border-stone-300 rounded px-2 py-1 w-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="border border-stone-300 rounded px-2 py-1 w-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value, era: '' })}
                          className="border border-stone-300 rounded px-1 py-1 text-xs w-full focus:outline-none">
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2 hidden md:table-cell">
                        {editForm.category === '日本史' ? (
                          <select value={editForm.era}
                            onChange={(e) => setEditForm({ ...editForm, era: e.target.value })}
                            className="border border-stone-300 rounded px-1 py-1 text-xs w-full focus:outline-none">
                            <option value="">なし</option>
                            {JAPANESE_ERAS.map((era) => <option key={era}>{era}</option>)}
                          </select>
                        ) : <span className="text-stone-300 text-xs">—</span>}
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <button onClick={() => handleSave(ev.id)}
                          className="bg-green-600 hover:bg-green-500 text-white rounded px-2 py-1 text-xs mr-1">保存</button>
                        <button onClick={() => setEditingId(null)}
                          className="bg-stone-400 hover:bg-stone-300 text-white rounded px-2 py-1 text-xs">取消</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={ev.id} className={`border-t border-stone-100 ${i % 2 === 1 ? 'bg-stone-50' : ''} hover:bg-amber-50 transition-colors`}>
                      <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap text-xs">
                        {formatYear(ev.year)}
                      </td>
                      <td className="px-4 py-3 font-medium">{ev.title}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${categoryColor[ev.category] ?? 'bg-stone-100 text-stone-600'}`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 hidden md:table-cell text-xs">
                        {ev.era ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button onClick={() => startEdit(ev)} className="text-amber-700 hover:text-amber-600 text-xs mr-3 font-medium">編集</button>
                        <button onClick={() => handleDelete(ev.id, ev.title)} className="text-red-500 hover:text-red-400 text-xs font-medium">削除</button>
                      </td>
                    </tr>
                  )
                )}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-stone-400">
                    {search || filterCategory !== 'すべて' ? '該当するデータがありません' : 'データがありません'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
