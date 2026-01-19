import { NextResponse } from 'next/server';

export async function GET() {
  const EXTERNAL_API_URL = 'http://silver-api.metabase.ltd/api/price/silver';

  try {
    const response = await fetch(EXTERNAL_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure we don't cache the response to get real-time data
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Upstream API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching silver price:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch price from upstream server' },
      { status: 500 }
    );
  }
}
