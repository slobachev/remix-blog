import { redirect, json } from "@remix-run/node";
import type { LoaderArgs , ActionArgs } from "@remix-run/node";

import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { updatePost, getPost, deletePost } from "~/models/post.server";
import AdminIndex from "./posts.admin._index";

export const loader = async ({ params }:  LoaderArgs) => {
  invariant(params.slug, "params.slug is required");
  const post = await getPost(params.slug);
  return json({ post });
};

export const action = async ({ params, request }: ActionArgs) => {
    // TODO: remove me
    await new Promise((res) => setTimeout(res, 1000));

    const formData = await request.formData();
    const slug = formData.get('slug')
    const title = formData.get('title')
    const markdown = formData.get('markdown')
    const action = formData.get("_action");

    invariant(
        typeof params.slug === "string",
        "params.slug must be a string"
    );
    if (action === "delete") {
        await deletePost(params.slug)
        return redirect("/posts/admin");
    }

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
    await updatePost(params.slug, { slug, title, markdown })
    return redirect('/posts/admin');
}

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function Post() {
  const { post } = useLoaderData<typeof loader>();
  const { title, markdown, slug } = post || {}
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting'
  const isEditing = isSubmitting && navigation.formData?.get('_action') === 'update'
  const isDeleting = isSubmitting && navigation.formData?.get('_action') === 'delete'
  

  return navigation.formData ? <AdminIndex /> :(
    <Form method="post" key={slug}>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            defaultValue={title}
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
            defaultValue={slug}
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
          defaultValue={markdown}
          className={`${inputClassName} font-mono`}
        />
      </p>
      <div className="flex gap-4 justify-end">
        <button
          type="submit"
          name="_action" 
          value="delete"
          className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
          disabled={isDeleting || isEditing}
        >
          {isDeleting ? "Deleting..." : "Delete Post"}
        </button>
        <button
          type="submit"
          name="_action"
          value="edit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isEditing || isDeleting}
        >
          {isEditing ? "Editing..." : "Edit Post"}
        </button>
      </div>
    </Form>
  );
}