import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const events = db.prepare('SELECT * FROM events ORDER BY year ASC').all();
  return Response.json(events);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, year, description } = body;

  if (!title || year === undefined || year === null) {
    return Response.json({ error: '出来事名と年号は必須です' }, { status: 400 });
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum)) {
    return Response.json({ error: '年号は数値で入力してください' }, { status: 400 });
  }

  const result = db
    .prepare('INSERT INTO events (title, year, description) VALUES (?, ?, ?)')
    .run(title.trim(), yearNum, description?.trim() || null);

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  return Response.json(event, { status: 201 });
}
