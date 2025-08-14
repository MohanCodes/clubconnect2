"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { FaCalendar, FaUser, FaArrowLeft, FaShare, FaClock } from 'react-icons/fa';
import LoadingModal from '@/components/LoadingModal';

interface Blog {
  id: string;
  title: string;
  content: string;
  date: Date;
  clubId: string;
  clubName: string;
  readTime?: number;
  tags?: string[];
}

const BlogPage = () => {
  const router = useRouter();
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate estimated read time
  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share && blogData) {
      try {
        await navigator.share({
          title: blogData.title,
          text: `Check out this blog post from ${blogData.clubName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
    alert('Link copied to clipboard!');
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      setIsLoading(true);
      setError(null);
      
      const pathname = window.location.pathname;
      const blogId = pathname.split('/').pop();

      if (!blogId) {
        setError('Invalid blog ID');
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'blogs', blogId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const content = data.content || '';
          const readTime = calculateReadTime(content);
          
          setBlogData({
            id: docSnap.id,
            title: data.title || 'Untitled',
            content,
            date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
            clubId: data.clubId || '',
            clubName: data.clubName || 'Unknown Club',
            readTime,
            tags: data.tags || []
          });
        } else {
          setError('Blog post not found');
          setTimeout(() => router.push('/404'), 2000);
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, [router]);

  if (isLoading) {
    return <LoadingModal loadingMessage="Loading Blog..." />;
  }

  if (error) {
    return (
      <div className="bg-cblack min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-400 text-2xl mb-4">⚠️</div>
            <div className="text-white text-xl mb-4">{error}</div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="bg-cblack min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-2xl">Blog not found</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{blogData.title} | {blogData.clubName}</title>
        <meta name="description" content={blogData.content.substring(0, 160)} />
        <meta property="og:title" content={blogData.title} />
        <meta property="og:description" content={blogData.content.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={blogData.date.toISOString()} />
        <meta property="article:author" content={blogData.clubName} />
      </Head>
      
      <div className="bg-cblack min-h-screen">
        <Navbar />
        
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8 max-w-4xl">
          <button
            onClick={() => router.back()}
            className="flex items-center text-grey hover:text-white transition-colors duration-200 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <main className="container mx-auto px-4 pb-12 max-w-4xl">
          {/* Header Section */}
          <header className="mb-8 pb-8 border-b border-gray-800">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {blogData.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-grey mb-6">
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                <time dateTime={blogData.date.toISOString()}>
                  {blogData.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blogData.clubName}</span>
              </div>
              
              {blogData.readTime && (
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  <span>{blogData.readTime} min read</span>
                </div>
              )}
              
              <button
                onClick={handleShare}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                <FaShare className="mr-2" />
                Share
              </button>
            </div>

            {/* Tags */}
            {blogData.tags && blogData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Blog Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-em:text-gray-300 prose-code:text-blue-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-300 prose-a:text-blue-400 prose-a:hover:text-blue-300">
              <ReactMarkdown
                components={{
                  // Custom components for better styling
                  h1: ({children}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold text-white mt-6 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-medium text-white mt-4 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({children, className}) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-800 text-blue-400 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  }
                }}
              >
                {blogData.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Footer Actions */}
          <footer className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-sm">
                Published by {blogData.clubName} on {blogData.date.toLocaleDateString()}
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Share Post
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Back to Posts
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default BlogPage;