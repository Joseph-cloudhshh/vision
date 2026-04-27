import { NextRequest, NextResponse } from 'next/server'
import { pollVideoJob } from '@/lib/ai-api'

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
  }

  try {
    const job = await pollVideoJob(jobId)
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to poll job' }, { status: 500 })
  }
}
