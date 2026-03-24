import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getMockUser } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const walletAddress = req.nextUrl.searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
  }

  try {
    // Try DB
    const users = await query(
      `SELECT * FROM users WHERE wallet_address = $1`,
      [walletAddress]
    );
    const user = users && users.length > 0 ? users[0] : null;

    let builderProjects: any[] = [];
    let backedProjects: any[] = [];

    if (user) {
      const bp = await query(
        `SELECT * FROM projects WHERE creator_wallet_address = $1 ORDER BY created_at DESC`,
        [walletAddress]
      );
      builderProjects = bp || [];

      const sp = await query(
        `SELECT s.*, p.title as project_title
         FROM supports s
         LEFT JOIN projects p ON s.project_id = p.id
         WHERE s.supporter_wallet_address = $1
         ORDER BY s.created_at DESC`,
        [walletAddress]
      );
      backedProjects = sp || [];

      return NextResponse.json({ user, builderProjects, backedProjects });
    }
  } catch {
    // fall through to mock
  }

  // Fallback
  return NextResponse.json({
    user: getMockUser(walletAddress),
    builderProjects: [],
    backedProjects: [],
  });
}
