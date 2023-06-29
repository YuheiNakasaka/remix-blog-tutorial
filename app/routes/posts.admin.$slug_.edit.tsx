import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import PostView from "~/conponents/post";
import type { Post } from "~/models/post.server";
import {
  updatePost,
  getPost,
  createPost,
  deletePost,
} from "~/models/post.server";

type LoaderData = { post?: Post };

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.slug, "params.slug is required");

  if (params.slug === "new") {
    return json<LoaderData>({});
  }

  const post = await getPost(params.slug);

  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

export const action = async ({ request }: ActionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent == "delete") {
    const slug = formData.get("slug") as string;
    invariant(typeof slug === "string", "slug must be a string");

    await deletePost(slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const markdown = formData.get("markdown") as string;

  const errors = {
    title: !title ? "Title is required" : null,
    slug: !slug ? "Slug is required" : null,
    markdown: !markdown ? "Markdown is required" : null,
  };
  const hasErrors = Object.values(errors).some((e) => e);

  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (intent == "new") {
    await createPost({ title, slug, markdown });
  } else if (intent == "edit") {
    await updatePost(slug, { title, slug, markdown });
  } else {
    throw new Error(`Unexpected intent: ${intent}`);
  }

  return redirect(`/posts/admin/${slug}`);
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function EditPostAdmin() {
  const { post } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isRequesting = Boolean(navigation.state === "submitting");
  const isNewPost = !post;

  return (
    <main className="col-span-4 md:col-span-3">
      {navigation.formData ? (
        <>
          <PostView
            post={{
              title: navigation.formData.get("title") as string,
              slug: navigation.formData.get("slug") as string,
              markdown: navigation.formData.get("markdown") as string,
            }}
          />
        </>
      ) : (
        <Form method="post" key={post?.slug ?? "new"}>
          <p>
            <label>
              Post Title:{" "}
              {errors?.title ? (
                <em className="text-red-600">{errors.title}</em>
              ) : null}
              <input
                type="text"
                name="title"
                className={inputClassName}
                defaultValue={post?.title}
              />
            </label>
          </p>
          <p>
            <label>
              Post Slug:{" "}
              {errors?.slug ? (
                <em className="text-red-600">{errors.slug}</em>
              ) : null}
              <input
                type="text"
                name="slug"
                className={inputClassName}
                defaultValue={post?.slug}
              />
            </label>
          </p>
          <p>
            <label htmlFor="markdown">
              Markdown:
              {errors?.markdown ? (
                <em className="text-red-600">{errors.markdown}</em>
              ) : null}
            </label>
            <br />
            <textarea
              id="markdown"
              rows={20}
              name="markdown"
              className={`${inputClassName} font-mono`}
              defaultValue={post?.markdown}
            />
          </p>
          <p className="text-right">
            {isNewPost ? null : (
              <button
                type="submit"
                name="intent"
                value={"delete"}
                className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
                disabled={isRequesting}
              >
                {isRequesting ? "削除中..." : "削除"}
              </button>
            )}
            <button
              type="submit"
              name="intent"
              value={isNewPost ? "new" : "edit"}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
              disabled={isRequesting}
            >
              {isRequesting ? "送信中..." : isNewPost ? "作成" : "更新"}
            </button>
          </p>
        </Form>
      )}
    </main>
  );
}
