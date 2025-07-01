"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Calendar, ArrowRight, Settings } from "lucide-react";
import { format } from "date-fns";

interface Post {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts", {
        cache: "no-store",
        next: {
          revalidate: 0,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* JSON-LD for homepage */}
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'My Blog',
            description: 'Discover insights, stories, and ideas through carefully crafted articles.',
            url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
            author: {
              '@type': 'Person',
              name: 'Blog Author',
            },
            publisher: {
              '@type': 'Organization',
              name: 'My Blog',
            },
          }),
        }}
      /> */}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PenTool className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">My Blog</h1>
              </div>
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-white/50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Welcome to My Blog
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover insights, stories, and ideas through carefully crafted
              articles. Join me on this journey of exploration and learning.
            </p>
            {posts.length > 0 && (
              <div className="flex justify-center">
                <Link href={`/blog/${posts[0].slug}`}>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Read Latest Post
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Posts Section */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Latest Articles
              </h2>
              <p className="text-lg text-slate-600">
                Explore my latest thoughts and insights
              </p>
            </div>

            {loading ? (
              // Simmer Ui
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white/60">
                    <CardHeader>
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              // Post cards
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <Card
                    key={post._id}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {index === 0 ? "Latest" : "Article"}
                        </Badge>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(post.createdAt), "MMM d")}
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link href={`/blog/${post.slug}`}>
                        <Button
                          variant="ghost"
                          className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300"
                        >
                          Read Article
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 text-slate-400 mb-6">
                  <PenTool className="h-full w-full" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No Posts Yet
                </h3>
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                  This blog is just getting started. Check back soon for fresh
                  content and insights.
                </p>
                <Link href="/admin">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Go to Admin Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/20 bg-white/80 backdrop-blur-sm py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <PenTool className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-slate-900">
                My Blog
              </span>
            </div>
            <p className="text-slate-600">
              Sharing thoughts, ideas, and stories through the written word.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
