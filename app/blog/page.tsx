import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Blog() {
  const posts = [
    { slug: 'first-post', title: 'First Post' },
    { slug: 'second-post', title: 'Second Post' },
    { slug: 'third-post', title: 'Third Post' },
  ];

  return (
    <div className="bg-cblack min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full">
          <h1 className="font-semibold text-white text-5xl mb-12 text-center">
            Blog <span className="text-azul">Posts</span>
          </h1>
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  <a className="text-2xl font-semibold text-azul hover:underline">
                    {post.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
