import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import PostView from "~/conponents/post";
import type { Post } from "~/models/post.server";
import { getPost } from "~/models/post.server";
import { requireAdmin } from "~/session.server";

type LoaderData = { post?: Post };

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireAdmin(request);

  invariant(params.slug, "params.slug is required");

  const post = await getPost(params.slug);

  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

export default function ShowPostAdmin() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <main className="col-span-4 md:col-span-3">
      <PostView
        post={{
          title: post?.title as string,
          slug: post?.slug as string,
          markdown: post?.markdown as string,
        }}
      />
    </main>
  );
}
