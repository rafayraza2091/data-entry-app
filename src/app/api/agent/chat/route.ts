import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden: Only owners can access the agent API' }, { status: 403 });
    }

    const body = await request.json();
    
    // Proxy the request to the local agent running on port 8000
    // Using host.docker.internal so the Docker container can reach the agent running on the host machine
    const agentUrl = process.env.AGENT_API_URL || 'http://host.docker.internal:8000/api/agent/chat';
    const res = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Agent API Error:', errorText);
      return NextResponse.json(
        { error: `Agent server responded with status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying to agent:', error);
    return NextResponse.json(
      { error: 'Could not connect to the agent server on port 8000. Is it running?' },
      { status: 500 }
    );
  }
}
