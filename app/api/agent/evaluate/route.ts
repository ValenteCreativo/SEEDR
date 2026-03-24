import { NextRequest, NextResponse } from 'next/server'
import { evaluateProject } from '@/lib/venice'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { project } = body

    if (!project?.id || !project?.milestones?.length) {
      return NextResponse.json({ error: 'project with milestones required' }, { status: 400 })
    }

    const evaluation = await evaluateProject(project)
    return NextResponse.json(evaluation)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
