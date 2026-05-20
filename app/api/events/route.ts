import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const era = searchParams.get('era');

  let query = 'SELECT * FROM events WHERE 1=1';
  const params: (string | number)[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (era) {
    query += ' AND era = ?';
    params.push(era);
  }
  query += ' ORDER BY year ASC';

  const events = db.prepare(query).all(params);
  return Response.json(events);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, year, description, category, era } = body;

  if (!title || year === undefined || year === null) {
    return Response.json({ error: '出来事名と年号は必須です' }, { status: 400 });
  }
  if (!category) {
    return Response.json({ error: 'カテゴリは必須です' }, { status: 400 });
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum)) {
    return Response.json({ error: '年号は数値で入力してください' }, { status: 400 });
  }

  const result = db
    .prepare('INSERT OR IGNORE INTO events (title, year, description, category, era) VALUES (?, ?, ?, ?, ?)')
    .run(title.trim(), yearNum, description?.trim() || null, category, era?.trim() || null);

  if (result.changes === 0) {
    return Response.json({ error: '同じ出来事名・年号の組み合わせがすでに存在します' }, { status: 409 });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  return Response.json(event, { status: 201 });
}
