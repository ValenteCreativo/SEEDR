import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MOCK_PROJECTS } from '@/lib/mock-data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Try DB
    const rows = await query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (rows && rows.length > 0) {
      const project = rows[0];
      const milestones = await query(
        `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY sort_order`,
        [id]
      );
      const benefits = await query(
        `SELECT * FROM support_benefits WHERE project_id = $1`,
        [id]
      );
      const supports = await query(
        `SELECT * FROM supports WHERE project_id = $1 ORDER BY created_at DESC`,
        [id]
      );
      return NextResponse.json({
        project: {
          ...project,
          milestones: milestones || [],
          benefits: benefits || [],
          supports: supports || [],
        },
      });
    }
  } catch {
    // fall through to mock
  }

  // Fallback to mock
  const mock = MOCK_PROJECTS.find((p) => p.id === id);
  if (mock) {
    return NextResponse.json({ project: mock });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
