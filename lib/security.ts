export function extractTextFromHtml(
  html: string,
  maxLength: number = 160
): string {
  // Remove HTML tags and get plain text
  const plainText = html.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  const decoded = plainText
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Trim and limit length
  return decoded.trim().substring(0, maxLength);
}

export function validatePostData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required and must be a string");
  } else if (data.title.trim().length < 1) {
    errors.push("Title cannot be empty");
  } else if (data.title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }

  if (!data.content || typeof data.content !== "string") {
    errors.push("Content is required and must be a string");
  } else if (data.content.trim().length < 1) {
    errors.push("Content cannot be empty");
  } else if (data.content.length > 50000) {
    errors.push("Content must be less than 50,000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const current = rateLimitMap.get(identifier);

  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}
