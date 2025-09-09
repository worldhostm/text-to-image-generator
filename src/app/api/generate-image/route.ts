// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

export const runtime = 'nodejs';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1) 예측 생성
    const prediction = await replicate.predictions.create({
      version: '27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478', // 안정 버전 유지/필요시 교체
      input: {
        prompt: `family-friendly, safe-for-work. ${prompt}`,
        negative_prompt:
          'nsfw, nude, nudity, sexual, explicit, blood, gore, violence, underage, child, hate, slur',
        width: 512,
        height: 512,
        num_outputs: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
      },
    });

    // 2) 폴링(간단 구현). SDK 버전에 따라 wait 유틸이 있을 수도 있음
    let pred = prediction;
    for (let i = 0; i < 30; i++) {
      if (pred.status === 'succeeded' || pred.status === 'failed' || pred.status === 'canceled') break;
      await new Promise(r => setTimeout(r, 1000));
      pred = await replicate.predictions.get(pred.id);
    }

    // 3) 상태별 응답
    if (pred.status !== 'succeeded') {
      // Replicate가 NSFW 차단 시 logs나 error에 힌트가 들어오는 경우가 많음
      const reason =
        (pred as any)?.error ||
        (pred as any)?.logs ||
        'Upstream did not produce an image.';
      const isNSFW = /nsfw|safety|content detected/i.test(String(reason));

      return NextResponse.json(
        {
          code: isNSFW ? 'NSFW_BLOCKED' : 'UPSTREAM_ERROR',
          error: String(reason).slice(0, 2000), // 너무 길면 잘라서 전달
        },
        { status: isNSFW ? 422 : 502 },
      );
    }

    const output = pred.output as string[] | null | undefined;

    if (!Array.isArray(output) || output.length === 0) {
      // 성공인데 빈 배열 → 대부분 필터/모델 내부 규칙에 걸린 케이스
      return NextResponse.json(
        {
          code: 'NO_IMAGE',
          error:
            'The model returned no image. This often happens when the prompt triggers safety filters. Try rewriting the prompt.',
          logs: (pred as any)?.logs ?? null,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ images: output }, { status: 200 });
  } catch (err: any) {
    console.error('generate error:', err);
    return NextResponse.json(
      { code: 'SERVER_ERROR', error: err?.message || 'Unexpected error' },
      { status: 500 },
    );
  }
}
