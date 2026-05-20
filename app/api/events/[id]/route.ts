import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, year, description } = body;

  if (!title || year === undefined || year === null) {
    return Response.json({ error: '出来事名と年号は必須です' }, { status: 400 });
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum)) {
    return Response.json({ error: '年号は数値で入力してください' }, { status: 400 });
  }

  db.prepare('UPDATE events SET title = ?, year = ?, description = ? WHERE id = ?').run(
    title.trim(),
    yearNum,
    description?.trim() || null,
    parseInt(id)
  );

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(parseInt(id));
  if (!event) return Response.json({ error: '見つかりません' }, { status: 404 });

  return Response.json(event);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(parseInt(id));
  if (!event) return Response.json({ error: '見つかりません' }, { status: 404 });

  db.prepare('DELETE FROM events WHERE id = ?').run(parseInt(id));
  return Response.json({ success: true });
}
