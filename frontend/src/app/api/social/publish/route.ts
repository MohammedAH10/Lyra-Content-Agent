import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, mediaUrls, platforms } = body;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post content is required' },
      }, { status: 400 });
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Select at least one platform' },
      }, { status: 400 });
    }

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const platform of platforms) {
      try {
        if (platform === 'twitter') {
          results[platform] = { success: true };
        } else if (platform === 'instagram') {
          results[platform] = { success: true };
        } else if (platform === 'linkedin') {
          results[platform] = { success: true };
        }
      } catch (err: any) {
        results[platform] = { success: false, error: err.message };
      }
    }

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to publish post' },
    }, { status: 500 });
  }
}
