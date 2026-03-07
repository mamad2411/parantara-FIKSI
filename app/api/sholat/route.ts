import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  const dateStr = searchParams.get("date");

  if (!cityId || !dateStr) {
    return NextResponse.json({ error: "Missing cityId or date" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${dateStr}`, {
      next: { revalidate: 3600 } // cache for 1 hour to avoid API rate limits
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ error: "Too Many Requests to MyQuran API" }, { status: 429 });
      }
      return NextResponse.json({ error: "API Error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Prayer API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
