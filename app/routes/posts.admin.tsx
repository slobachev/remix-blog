import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import type { Navigation } from "react-router";

import { getPosts } from "~/models/post.server";

export const loader = async () => {
  return json({ posts: await getPosts() });
};

const getOptimisticPosts = (navigation: Navigation, posts: any[]) => {
  if (navigation.formData) {
    const action = navigation.formData?.get('_action')
    const title = navigation.formData?.get('title');
    const slug = navigation.formData?.get('slug');
    const markdown = navigation.formData?.get('markdown');

    if (action === 'delete') {
      return posts.filter(p => p.slug !== slug)
    } else if (action === 'edit') {
      return posts.map(p => p.slug === slug ? { title, slug, markdown } : p)
    } else if (action === 'create') {
      return [...posts, { title, slug, markdown }]
    }
  }
  return posts
}

export default function PostAdmin() {
  const { posts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const optimisticPosts = getOptimisticPosts(navigation, posts)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {optimisticPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`${post.slug}`}
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}