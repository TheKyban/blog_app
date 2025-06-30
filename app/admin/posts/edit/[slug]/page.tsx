'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import { generateSlug } from '@/lib/utils/slug';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const newSlug = generateSlug(title);
  const slugChanged = post && newSlug !== post.slug;

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
        setTitle(data.post.title);
        setContent(data.post.content);
      } else {
        toast.error('Post not found');
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to fetch post');
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/posts/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Post updated successfully!');
        
        // If slug changed, redirect to the new edit URL
        if (slugChanged) {
          router.push(`/admin/posts/edit/${data.post.slug}`);
        } else {
          // Refresh the post data
          setPost(data.post);
        }
      } else {
        toast.error(data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Post</h1>
            <p className="text-slate-600 mt-2">Update your blog post</p>
          </div>
        </div>
        <Link href={`/blog/${post.slug}`} target="_blank">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview Post
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>
              Update the title and content for your blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="text-lg"
              />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Current URL: <span className="font-mono bg-slate-100 px-2 py-1 rounded">/blog/{post.slug}</span></span>
                {slugChanged && (
                  <span className="text-amber-600">
                    New URL: <span className="font-mono bg-amber-100 px-2 py-1 rounded">/blog/{newSlug}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog post content here..."
              />
            </div>

            {slugChanged && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Changing the title will update the URL slug. 
                  Make sure to update any existing links to this post.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link href="/admin/posts">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={saving || !title.trim() || !content.trim()}
              >
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Post
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}