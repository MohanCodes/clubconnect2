import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Head from 'next/head';

export async function generateStaticParams() {
  const files = await fs.readdir(path.join(process.cwd(), 'blogs'));
  return files.map(filename => ({
    slug: filename.replace('.mdx', '')
  }));
}

async function getPost({ slug }: { slug: string }) {
  const markdownFile = await fs.readFile(path.join(process.cwd(), 'blogs', `${slug}.mdx`), 'utf-8');
  const { data: frontMatter, content } = matter(markdownFile);
  return {
    frontMatter,
    slug,
    content
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params; // Await the params object
  const props = await getPost({ slug });
  
  return (
    <div>
      <Head>
        <title>{props.frontMatter.title}</title>
        <meta name="description" content={props.frontMatter.description} />
        <meta name="date" content={props.frontMatter.date} />
        <meta name="author" content={"Mohan Atkuri"} />
        <meta property="og:title" content={props.frontMatter.title} />
        <meta property="og:description" content={props.frontMatter.description} />
        <meta property="og:type" content="article" />
      </Head>
      <article className='prose prose-md md:prose-lg lg:prose-2xl prose-slate prose-invert mx-auto py-8 mt-20
                     prose-h1:text-4xl prose-h1:font-bold
                     prose-h2:text-2xl prose-h2:font-semibold
                     prose-h3:text-xl prose-h3:font-medium
                     prose-code:bg-gray-800 prose-code:p-1 prose-code:rounded
                     px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20'>
       <h1>{props.frontMatter.title}</h1>
        <MDXRemote source={props.content} />
      </article>
    </div>
  );
}
