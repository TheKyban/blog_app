import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 text-slate-400 mb-6">
          <FileText className="h-full w-full" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Post Not Found</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          The blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}