import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/lib/models/Post';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { sanitizeHtml, validatePostData } from '@/lib/security';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    
    const post = await Post.findOne({ slug: params.slug }).lean();

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Add cache headers for better performance
    const response = NextResponse.json({
      success: true,
      post: {
        _id: post._id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication check
    const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    const requestData = await request.json();
    
    // Validate input data
    const validation = validatePostData(requestData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { title, content } = requestData;

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);

    const existingPost = await Post.findOne({ slug: params.slug });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Generate new slug if title changed
    let newSlug = existingPost.slug;
    if (title.trim() !== existingPost.title) {
      const existingPosts = await Post.find({ slug: { $ne: params.slug } }, 'slug');
      const existingSlugs = existingPosts.map(post => post.slug);
      newSlug = generateUniqueSlug(title, existingSlugs);
    }

    const updatedPost = await Post.findOneAndUpdate(
      { slug: params.slug },
      {
        title: title.trim(),
        content: sanitizedContent,
        slug: newSlug,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      post: {
        _id: updatedPost._id,
        title: updatedPost.title,
        content: updatedPost.content,
        slug: updatedPost.slug,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication check
    const token = getTokenFromRequest(request) || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    const deletedPost = await Post.findOneAndDelete({ slug: params.slug });

    if (!deletedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}