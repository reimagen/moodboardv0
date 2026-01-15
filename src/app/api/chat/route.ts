import { NextRequest, NextResponse } from 'next/server';
import { InMemoryRunner } from '@google/adk';
import { moodboardAgent } from '@/lib/agents/moodboard-agent';

// Initialize runner (singleton for the API route)
const runner = new InMemoryRunner({
  agent: moodboardAgent,
  appName: 'moodboard',
});

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId = 'default_user' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = await runner.sessionService.createSession({
        appName: 'moodboard',
        userId,
      });
      currentSessionId = session.id;
    }

    // Run the agent
    const content = {
      role: 'user' as const,
      parts: [{ text: message }],
    };

    const stream = runner.runAsync({
      userId,
      sessionId: currentSessionId,
      newMessage: content,
    });

    // Collect responses
    const responses: string[] = [];
    for await (const event of stream) {
      // Check for final response with text content
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          if ('text' in part && part.text) {
            responses.push(part.text);
          }
        }
      }
    }

    return NextResponse.json({
      response: responses.join(''),
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
