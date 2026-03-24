import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MOCK_PROJECTS } from '@/lib/mock-data';

export async function GET() {
  try {
    // Try DB
    const projects = await query(
      `SELECT * FROM projects WHERE status = 'active' ORDER BY created_at DESC`
    );

    if (projects && projects.length > 0) {
      // Fetch milestones and benefits for each project
      const enriched = await Promise.all(
        projects.map(async (p: any) => {
          const milestones = await query(
            `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY sort_order`,
            [p.id]
          );
          const benefits = await query(
            `SELECT * FROM support_benefits WHERE project_id = $1`,
            [p.id]
          );
          return { ...p, milestones: milestones || [], benefits: benefits || [] };
        })
      );
      return NextResponse.json({ projects: enriched });
    }

    // Fallback to mock
    return NextResponse.json({ projects: MOCK_PROJECTS });
  } catch {
    return NextResponse.json({ projects: MOCK_PROJECTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      tagline,
      description,
      category,
      fundingGoalSol,
      milestones,
      benefits,
      creatorWalletAddress,
    } = body;

    if (!title || !tagline || !description || !creatorWalletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try DB
    const rows = await query(
      `INSERT INTO projects (title, tagline, description, category, funding_goal_sol, creator_wallet_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, tagline, description, category || null, fundingGoalSol || 10, creatorWalletAddress]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];

      // Insert milestones
      if (milestones?.length) {
        for (let i = 0; i < milestones.length; i++) {
          const ms = milestones[i];
          if (ms.title) {
            await query(
              `INSERT INTO project_milestones (project_id, title, description, sort_order)
               VALUES ($1, $2, $3, $4)`,
              [project.id, ms.title, ms.description || null, i]
            );
          }
        }
      }

      // Insert benefits
      if (benefits?.length) {
        for (const b of benefits) {
          if (b.title) {
            await query(
              `INSERT INTO support_benefits (project_id, title, description)
               VALUES ($1, $2, $3)`,
              [project.id, b.title, b.description || null]
            );
          }
        }
      }

      return NextResponse.json({ project });
    }

    // Fallback: return mock-created project
    return NextResponse.json({
      project: {
        id: 'mock-new-' + Date.now(),
        title,
        tagline,
        description,
        category,
        funding_goal_sol: fundingGoalSol || 10,
        current_backed_sol: 0,
        creator_wallet_address: creatorWalletAddress,
        status: 'active',
        milestones: milestones || [],
        benefits: benefits || [],
        created_at: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
