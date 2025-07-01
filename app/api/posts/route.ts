import { Prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const posts = await Prisma.post.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    const response = NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        _id: post.id,
        title: post.title,
        slug: post.slug,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });

    // Cache for 2 minutes
    // response.headers.set(
    //   "Cache-Control",
    //   "public, s-maxage=120, stale-while-revalidate=300"
    // );

    return response;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
