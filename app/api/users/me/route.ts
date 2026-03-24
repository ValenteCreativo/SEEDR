import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getMockUser, MOCK_PROJECTS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const walletAddress = req.nextUrl.searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
  }

  try {
    // Upsert user on first visit
    await query(
      `INSERT INTO users (wallet_address, role_preference)
       VALUES ($1, 'backer')
       ON CONFLICT (wallet_address) DO NOTHING`,
      [walletAddress]
    );

    const users = await query(`SELECT * FROM users WHERE wallet_address = $1`, [walletAddress]);
    const user = users?.[0] ?? null;

    // Builder projects
    const bp = await query(
      `SELECT * FROM projects WHERE creator_wallet_address = $1 ORDER BY created_at DESC`,
      [walletAddress]
    );
    const builderProjects = bp || [];

    // Backed projects — join with mock data for title/tagline/category/images
    const sp = await query(
      `SELECT s.id, s.project_id, s.amount_sol, s.tx_signature, s.created_at
       FROM supports s
       WHERE s.supporter_wallet_address = $1
       ORDER BY s.created_at DESC`,
      [walletAddress]
    );

    // Enrich with project info (from mock data or DB)
    const backedProjects = (sp || []).map((s: any) => {
      const mock = MOCK_PROJECTS.find(p => p.id === s.project_id);
      return {
        ...s,
        project: mock
          ? {
              id: mock.id,
              title: mock.title,
              tagline: mock.tagline,
              category: mock.category,
              cover_image_url: mock.cover_image_url,
              funding_goal_sol: mock.funding_goal_sol,
              current_backed_sol: mock.current_backed_sol,
              status: mock.status,
            }
          : { id: s.project_id, title: s.project_id, tagline: '', category: '', status: 'active' },
      };
    });

    return NextResponse.json({ user, builderProjects, backedProjects });
  } catch (e: any) {
    console.error('[users/me]', e.message);
    return NextResponse.json({
      user: getMockUser(walletAddress),
      builderProjects: [],
      backedProjects: [],
    });
  }
}
