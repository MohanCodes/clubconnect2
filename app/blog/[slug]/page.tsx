import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

const BlogPost = ({ post }) => {
  const router = useRouter();
  const { slug } = router.query;

  if (!post) {
    return (
      <div className="bg-cblack min-h-screen flex flex-col items-center justify-center text-center">
        <Navbar />
        <div className="text-white">
          <h1 className="text-5xl font-semibold">Post Not Found</h1>
          <p className="text-xl mt-6 text-grey">We couldn't find the post you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-16">
        <article className="max-w-3xl w-full">
          <h1 className="font-semibold text-white text-5xl mb-12 text-center">{post.title}</h1>
          <div className="text-grey space-y-6">
            <p>{post.content}</p>
          </div>
        </article>
      </main>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return {
    props: {
      post,
    },
  };
}

export default BlogPost;
