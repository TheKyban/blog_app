import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { sanitizeHtml, validatePostData, checkRateLimit } from "@/lib/security";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`create-post:${clientIP}`, 10, 600000)) {
      // 10 posts per 10 minutes
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Authentication check
    const token =
      getTokenFromRequest(request) || request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const requestData = await request.json();
    // // Validate input data
    // const validation = validatePostData(requestData);
    // console.log(validation);
    // if (!validation.isValid) {
    //   return NextResponse.json(
    //     { error: "Validation failed", details: validation.errors },
    //     { status: 400 }
    //   );
    // }

    const { title, content } = requestData;

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);

    // Get existing slugs to ensure uniqueness
    const existingPosts = await Post.find({}, "slug");
    const existingSlugs = existingPosts.map((post) => post.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(title, existingSlugs);

    // Create new post
    const post = new Post({
      title: title.trim(),
      content: sanitizedContent,
      slug,
    });

    await post.save();

    return NextResponse.json({
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
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
