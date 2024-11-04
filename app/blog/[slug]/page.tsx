"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { FaCalendar, FaUser } from 'react-icons/fa';

interface Blog {
  id: string;
  title: string;
  content: string;
  date: Date;
  clubId: string;
  clubName: string;
}

const BlogPage = () => {
  const router = useRouter();
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      setIsLoading(true);
      const pathname = window.location.pathname;
      const blogId = pathname.split('/').pop();

      if (blogId) {
        try {
          const docRef = doc(db, 'blogs', blogId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBlogData({
              id: docSnap.id,
              title: data.title,
              content: data.content,
              date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
              clubId: data.clubId,
              clubName: data.clubName
            });
          } else {
            console.log('No such document!');
            router.push('/404'); // Redirect to 404 page if blog not found
          }
        } catch (error) {
          console.error('Error fetching blog data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchBlogData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-cblack min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="bg-cblack min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Blog not found</div>
      </div>
    );
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-5xl font-bold text-white mb-6">{blogData.title}</h1>
        <div className="flex items-center text-grey mb-8">
          <FaCalendar className="mr-2" />
          <span className="mr-4">{blogData.date.toLocaleDateString()}</span>
          <FaUser className="mr-2" />
          <span>{blogData.clubName}</span>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{blogData.content}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;