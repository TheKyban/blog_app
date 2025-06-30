import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePostSEO, generateArticleJsonLd } from "@/lib/seo";

interface Post {
  _id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/posts/${slug}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.post : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | My Blog",
      description: "The requested blog post could not be found.",
    };
  }

  const seoData = generatePostSEO(post);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: ["blog", "article", "insights", "stories"],
    authors: [{ name: seoData.author }],
    creator: seoData.author,
    publisher: "My Blog",
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.url,
      siteName: "My Blog",
      images: [
        {
          url: seoData.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      authors: [seoData.author],
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: [seoData.image],
      creator: "@yourtwitterhandle", // Replace with actual Twitter handle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: seoData.url,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  console.log(params);
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const createdDate = new Date(post.createdAt);
  const updatedDate = new Date(post.updatedAt);
  const isUpdated = updatedDate.getTime() > createdDate.getTime();
  const jsonLd = generateArticleJsonLd(post);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center space-x-6 text-slate-600 border-b border-slate-200 pb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.createdAt} className="text-sm">
                  Published {format(createdDate, "MMMM d, yyyy")}
                </time>
              </div>

              {isUpdated && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <time dateTime={post.updatedAt} className="text-sm">
                    Updated {format(updatedDate, "MMM d, yyyy")}
                  </time>
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-lg prose-slate max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="blog-content"
            />
          </div>

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <p>Published on {format(createdDate, "MMMM d, yyyy")}</p>
                {isUpdated && (
                  <p>Last updated on {format(updatedDate, "MMMM d, yyyy")}</p>
                )}
              </div>
              <Link href="/">
                {/* <Button variant="outline">← More Articles</Button> */}
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}
