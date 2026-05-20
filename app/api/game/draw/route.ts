import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const usedIds: number[] = body.usedIds ?? [];

  let event: unknown;
  if (usedIds.length > 0) {
    const placeholders = usedIds.map(() => '?').join(',');
    const stmt = db.prepare(
      `SELECT * FROM events WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`
    );
    event = stmt.get(usedIds);
  } else {
    event = db.prepare('SELECT * FROM events ORDER BY RANDOM() LIMIT 1').get();
  }

  if (!event) {
    return Response.json({ error: 'カードがなくなりました' }, { status: 404 });
  }

  const e = event as { id: number; title: string };
  return Response.json({ id: e.id, title: e.title });
}
