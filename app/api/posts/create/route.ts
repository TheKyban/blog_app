import { NextRequest, NextResponse } from "next/server";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { Prisma } from "@/prisma/prisma";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    // const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    // if (!checkRateLimit(`create-post:${clientIP}`, 10, 600000)) {
    //   // 10 posts per 10 minutes
    //   return NextResponse.json(
    //     { error: "Rate limit exceeded. Please try again later." },
    //     { status: 429 }
    //   );
    // }

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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

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

    // Get existing slugs to ensure uniqueness
    const existingPosts = await Prisma.post.findMany({
      select: { slug: true },
    });
    const existingSlugs = existingPosts.map((post) => post.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(title, existingSlugs);

    // Create new post
    const post = await Prisma.post.create({
      data: {
        title: title.trim(),
        content: content,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        _id: post.id,
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
