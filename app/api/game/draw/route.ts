import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const usedIds: number[] = body.usedIds ?? [];
  const categories: string[] = body.categories ?? [];
  const eras: string[] = body.eras ?? [];

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (usedIds.length > 0) {
    conditions.push(`id NOT IN (${usedIds.map(() => '?').join(',')})`);
    params.push(...usedIds);
  }
  if (categories.length > 0) {
    conditions.push(`category IN (${categories.map(() => '?').join(',')})`);
    params.push(...categories);
  }
  if (eras.length > 0) {
    conditions.push(`era IN (${eras.map(() => '?').join(',')})`);
    params.push(...eras);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT id, title, category FROM events ${where} ORDER BY RANDOM() LIMIT 1`);
  const event = stmt.get(params) as { id: number; title: string; category: string } | undefined;

  if (!event) {
    return Response.json({ error: 'カードがなくなりました' }, { status: 404 });
  }

  return Response.json({ id: event.id, title: event.title, category: event.category });
}
