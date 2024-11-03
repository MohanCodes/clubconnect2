import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Blog() {
    const blogDir = "blogs";
    const files = fs.readdirSync(path.join(blogDir));
    const blogs = files.map(filename => {
        const fileContent = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
        const { data: frontMatter } = matter(fileContent);
        return {
            meta: frontMatter,
            slug: filename.replace('.mdx', '')
        };
    });

    return (
        <main className='text-white'>
            <div className='md:max-w-screen-xl text-white md:mx-auto'>
                <Navbar />
                <section>
                    <h1>item</h1>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {blogs.map(blog => (
                            <Link href={'/blog/' + blog.slug} passHref key={blog.slug}>
                                <div className="text-cgray bg-white p-6 rounded-lg shadow-lg hover:opacity-75 hover:scale-110 transition duration-300">
                                    <h3 className="text-2xl mb-4 font-bold">{blog.meta.title}</h3>
                                    <p className="text-lg">{blog.meta.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
