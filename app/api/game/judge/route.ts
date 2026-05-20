import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cardId, timelineIds, position }: {
    cardId: number;
    timelineIds: number[];
    position: number;
  } = body;

  const card = db.prepare('SELECT * FROM events WHERE id = ?').get(cardId) as
    | { id: number; title: string; year: number; category: string; era: string | null }
    | undefined;

  if (!card) {
    return Response.json({ error: 'カードが見つかりません' }, { status: 404 });
  }

  let correct = true;

  if (timelineIds.length > 0) {
    const timelineYears = timelineIds.map((id) => {
      const row = db.prepare('SELECT year FROM events WHERE id = ?').get(id) as { year: number };
      return row.year;
    });

    const prevYear = position > 0 ? timelineYears[position - 1] : -Infinity;
    const nextYear = position < timelineYears.length ? timelineYears[position] : Infinity;

    correct = card.year >= prevYear && card.year <= nextYear;
  }

  return Response.json({
    correct,
    year: card.year,
    title: card.title,
    era: card.era,
  });
}
