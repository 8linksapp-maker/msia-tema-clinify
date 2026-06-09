import { getCollection } from 'astro:content';

/** Posts publicados (não-draft), ordenados do mais recente pro mais antigo. */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
