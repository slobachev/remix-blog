import { redirect, type ActionArgs, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { createPost } from "~/models/post.server";
import AdminIndex from "./posts.admin._index";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
    const formData = await request.formData();
    const slug = formData.get('slug')
    const title = formData.get('title')
    const markdown = formData.get('markdown')
     const action = formData.get("_action");

    if (action === "close") {
        return redirect("/posts/admin");
    }

    await requireUserId(request);

    const errors = {
        title: title ? null : 'Title is required',
        slug: slug ? null : 'Slug is required',
        markdown: markdown ? null : 'Markdown is required',
    }

    const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
    );
    if (hasErrors) {
        return json(errors);
    }

    invariant(
        typeof title === "string",
        "title must be a string"
    );
    invariant(
        typeof slug === "string",
        "slug must be a string"
    );
    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    );
    await createPost({ slug, title, markdown })
    return redirect('/posts/admin');
}

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = Boolean(
    navigation.state === "submitting"
  );

  return navigation.formData ? <AdminIndex /> : (
    <Form method="post">
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
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown: 
        {errors?.markdown ? (
            <em className="text-red-600">
              {errors.markdown}
            </em>
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
      <div className="flex gap-4 justify-end">
        <button
          type="submit"
          name="_action"
          value="close"
          className="rounded bg-gray-500 py-2 px-4 text-white hover:bg-gray-600 focus:bg-gray-400 disabled:bg-gray-300"
          disabled={isCreating}
        >
          Back
        </button>
        <button
          type="submit"
          name="_action"
          value="create"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Post"}
        </button>
      </div>
    </Form>
  );
}