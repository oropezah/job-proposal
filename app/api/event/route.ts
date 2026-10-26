import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;

    // Leemos las variables exactas con los nombres que tienes en Vercel
    const supabaseUrl = process.env.SUPABASE_URL || 'https://temdvwaqgwgloduygwxj.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseKey) {
      return NextResponse.json({ error: 'Supabase Key not configured' }, { status: 500 });
    }

    // Consulta a Supabase desde el servidor de Next.js (Server-side)
    const res = await fetch(`${supabaseUrl}/rest/v1/pitches?slug=eq.${slug}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}