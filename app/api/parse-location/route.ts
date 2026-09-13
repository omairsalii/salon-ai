import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'الرابط مطلوب' }, { status: 400 });
    }

    let finalUrl = url;

    // إذا كان الرابط مختصراً، نقوم بفك الرابط لمعرفة الرابط الأصلي
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      const response = await fetch(url, { redirect: 'follow' });
      finalUrl = response.url;
    }

    // البحث عن الإحداثيات داخل الرابط (غالباً تأتي بصيغة @lat,lng أو ?q=lat,lng)
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match && match[1] && match[2]) {
      return NextResponse.json({
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      });
    }

    // صيغة أخرى محتملة في روابط قوقل (مثل q=lat,lng)
    const queryRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = finalUrl.match(queryRegex);

    if (queryMatch && queryMatch[1] && queryMatch[2]) {
      return NextResponse.json({
        lat: parseFloat(queryMatch[1]),
        lng: parseFloat(queryMatch[2]),
      });
    }

    return NextResponse.json({ error: 'لم يتم العثور على إحداثيات داخل هذا الرابط، تأكد أنه رابط موقع قوقل صحيح.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'فشل في تحليل الرابط' }, { status: 500 });
  }
}