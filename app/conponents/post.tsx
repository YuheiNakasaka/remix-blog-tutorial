import { marked } from "marked";
import type { PostData } from "~/models/post.server";

export default function PostView({ post }: PostData) {
  const { markdown } = post;
  const html = marked(markdown);
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Some Post: {post?.title}
      </h1>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </main>
  );
}
