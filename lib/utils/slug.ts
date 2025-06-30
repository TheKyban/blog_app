import slugify from 'slugify';

export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let baseSlug = generateSlug(title);
  let finalSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return finalSlug;
}