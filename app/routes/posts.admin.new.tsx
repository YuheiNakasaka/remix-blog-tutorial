import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import PostView from "~/conponents/post";
import { createPost } from "~/models/post.server";

export const action = async ({ request }: ActionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const formData = await request.formData();
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

  await createPost({ title, slug, markdown });
  return redirect(`/posts/admin/${slug}`);
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === "submitting");

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
        <Form method="post">
          <p>
            <label>
              Post Title:{" "}
              {errors?.title ? (
                <em className="text-red-600">{errors.title}</em>
              ) : null}
              <input type="text" name="title" className={inputClassName} />
            </label>
          </p>
          <p>
            <label>
              Post Slug:{" "}
              {errors?.slug ? (
                <em className="text-red-600">{errors.slug}</em>
              ) : null}
              <input type="text" name="slug" className={inputClassName} />
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
            />
          </p>
          <p className="text-right">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
              disabled={isCreating}
            >
              {isCreating ? "作成中..." : "作成"}
            </button>
          </p>
        </Form>
      )}
    </main>
  );
}
