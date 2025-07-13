import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conceptId: string }> }
) {
  try {
    const resolvedParams = await params
    const conceptId = resolvedParams.conceptId
    
    // Connect to MongoDB and fetch the concept using the public content endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/concepts/content/${conceptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch concept from backend')
    }

    const concept = await response.json()
    
    return NextResponse.json(concept)
  } catch (error) {
    console.error('Error fetching concept:', error)
    return NextResponse.json(
      { error: 'Failed to fetch concept' },
      { status: 500 }
    )
  }
} 