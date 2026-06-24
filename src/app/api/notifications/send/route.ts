import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase/admin';
import { z } from 'zod';

const NotificationSchema = z.object({
  tokens: z.array(z.string()).min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = NotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.issues }, { status: 400 });
    }

    const { tokens, title, body: notificationBody, data } = parsed.data;

    // Send multicast message using Firebase Admin SDK
    const message = {
      notification: {
        title,
        body: notificationBody,
      },
      data: data || {},
      tokens: tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(message);
    
    // Check for failed tokens (e.g. expired or invalid tokens)
    const failedTokens: string[] = [];
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx: number) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens 
    });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
