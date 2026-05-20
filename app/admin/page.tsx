'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Event = {
  id: number;
  title: string;
  year: number;
  description: string | null;
};

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', year: '', description: '' });
  const [editForm, setEditForm] = useState({ title: '', year: '', description: '' });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }

  function showMsg(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.year) return;
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, year: parseInt(form.year), description: form.description }),
    });
    if (res.ok) {
      setForm({ title: '', year: '', description: '' });
      fetchEvents();
      showMsg('出来事を追加しました', 'success');
    } else {
      const err = await res.json();
      showMsg(err.error ?? '追加に失敗しました', 'error');
    }
  }

  function startEdit(ev: Event) {
    setEditingId(ev.id);
    setEditForm({ title: ev.title, year: String(ev.year), description: ev.description ?? '' });
  }

  async function handleSave(id: number) {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editForm.title, year: parseInt(editForm.year), description: editForm.description }),
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
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchEvents();
      showMsg('削除しました', 'success');
    } else {
      showMsg('削除に失敗しました', 'error');
    }
  }

  const filtered = events.filter(
    (e) =>
      e.title.includes(search) ||
      String(e.year).includes(search) ||
      (e.description ?? '').includes(search)
  );

  function formatYear(year: number) {
    return year < 0 ? `紀元前${Math.abs(year)}年` : `${year}年`;
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-amber-700 hover:text-amber-600 text-2xl">←</Link>
          <h1 className="text-3xl font-bold text-amber-800">イベント管理</h1>
          <span className="ml-auto text-stone-500 text-sm">{events.length}件登録中</span>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* 追加フォーム */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-bold text-lg mb-4 text-stone-700">新しい出来事を追加</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-3 flex-wrap">
              <input
                type="number"
                placeholder="年号（例: 1945、紀元前は -44）"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="border border-stone-300 rounded-lg px-3 py-2 w-52 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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

        {/* 検索 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
        </div>

        {/* 一覧テーブル */}
        {loading ? (
          <p className="text-stone-500 text-center py-12">読み込み中...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 text-amber-900">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold w-28">年号</th>
                  <th className="text-left px-4 py-3 font-semibold">出来事名</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">説明</th>
                  <th className="px-4 py-3 w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) =>
                  editingId === ev.id ? (
                    <tr key={ev.id} className="border-t border-stone-100 bg-amber-50">
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                          className="border border-stone-300 rounded px-2 py-1 w-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="border border-stone-300 rounded px-2 py-1 w-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="border border-stone-300 rounded px-2 py-1 w-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleSave(ev.id)}
                          className="bg-green-600 hover:bg-green-500 text-white rounded px-2 py-1 text-xs mr-1"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-stone-400 hover:bg-stone-300 text-white rounded px-2 py-1 text-xs"
                        >
                          取消
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={ev.id} className={`border-t border-stone-100 ${i % 2 === 1 ? 'bg-stone-50' : ''} hover:bg-amber-50 transition-colors`}>
                      <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap">
                        {formatYear(ev.year)}
                      </td>
                      <td className="px-4 py-3 font-medium">{ev.title}</td>
                      <td className="px-4 py-3 text-stone-500 hidden md:table-cell text-xs leading-relaxed">
                        {ev.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => startEdit(ev)}
                          className="text-amber-700 hover:text-amber-600 text-xs mr-3 font-medium"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.title)}
                          className="text-red-500 hover:text-red-400 text-xs font-medium"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  )
                )}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-stone-400">
                      {search ? '検索結果がありません' : 'データがありません'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
