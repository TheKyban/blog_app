import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .select('_id title slug createdAt updatedAt')
      .lean();

    const response = NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });

    // Cache for 2 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}