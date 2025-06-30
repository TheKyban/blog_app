import { extractTextFromHtml } from './security';

export interface SEOData {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'website';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  image?: string;
}

export function generatePostSEO(post: {
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}): SEOData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const description = extractTextFromHtml(post.content, 160);

  return {
    title: `${post.title} | My Blog`,
    description: description || 'Read this article on My Blog',
    url: `${baseUrl}/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
    author: 'Blog Author', // You can make this dynamic
    image: `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`, // OG image endpoint
  };
}

export function generateHomeSEO(): SEOData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title: 'My Blog - Insights, Stories, and Ideas',
    description: 'Discover insights, stories, and ideas through carefully crafted articles. Join me on this journey of exploration and learning.',
    url: baseUrl,
    type: 'website',
  };
}

// JSON-LD structured data for better SEO
export function generateArticleJsonLd(post: {
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const description = extractTextFromHtml(post.content, 160);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: description,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Blog Author',
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  };
}