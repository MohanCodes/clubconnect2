import dynamic from 'next/dynamic';
import Link from 'next/link';

const Navbar = dynamic(() => import('@/components/Navbar'));

export default function About() {
  const devlogEntries = [
    {
      date: '2025-07-31',
      title: 'Filtering Improvements',
      description: 'Enhanced filtering capabilities for better search and organization.',
    },
    {
      date: '2025-07-16',
      title: 'Dependency Cleanup',
      description: 'Removed unused and redundant dependencies to optimize project size and speed.',
    },
    {
      date: '2025-07-15',
      title: 'Codebase Refactor Realization',
      description: 'Identified and began refactoring messy codebase to improve maintainability.',
    },
    {
      date: '2025-06-22',
      title: 'Blog UX and Club Flow',
      description: 'Redirect non-logged in users to club page; blog column UI isolation; bug fixes.',
    },
    {
      date: '2025-04-30',
      title: 'Admin Error Handling and UI Fixes',
      description: 'Added user display in admin panel, improved club info modal, fixed error messages.',
    },
    {
      date: '2025-04-29',
      title: 'Upvote and Transfer Ownership Enhancements',
      description: 'Upvote system enhancements, transfer ownership flow conciseness, UI tweaks.',
    },
    {
      date: '2025-04-26',
      title: 'Forgot Password Flow',
      description: 'Implemented forgot password feature for user account recovery.',
    },
    {
      date: '2024-11-29',
      title: 'Dependency and Skeleton Loader Fixes',
      description: 'Fixes for dependencies and added skeleton loader on main tiles.',
    },
    {
      date: '2024-11-15',
      title: 'Club Dashboard and Modularization',
      description: 'Modular dashboard with features like club upvotes, tile display, and completeness.',
    },
    {
      date: '2024-11-07',
      title: 'Lazy Loading Optimization',
      description: 'Optimized lazy loading to improve image and data fetch performance.',
    },
    {
      date: '2024-11-06',
      title: 'SEO and Metadata Enhancements',
      description: 'Added sitemap, robots.txt, openGraph, canonical URLs for SEO.',
    },
    {
      date: '2024-11-03',
      title: 'Blog Post Rendering and Listing',
      description: 'Dynamic blog post pages and blog listing enhancements.',
    },
    {
      date: '2024-11-02',
      title: 'User Upvotes and Profile Management',
      description: 'User profile page with club selection and upvote functionality.',
    },
    {
      date: '2024-10-30',
      title: 'Club Data Model Changes',
      description: 'Changed doc IDs to use clubName-school for better uniqueness.',
    },
    {
      date: '2024-10-29',
      title: 'Navigation Based on Club Completeness',
      description: 'Redirect users to edit or display pages based on club completion status.',
    },
    {
      date: '2024-10-28',
      title: 'Firebase Image Upload and Club Editing',
      description: 'Added image upload/delete for club and student leads via Firebase Storage.',
    },
    {
      date: '2024-10-26',
      title: 'Student Leads Email Links',
      description: 'Changed student leads section to email links, removed profile images.',
    },
    {
      date: '2024-10-25',
      title: 'Image Upload and Deletion UI Improvements',
      description: 'UI for image upload, trash icons, and file inputs for club images.',
    },
  ];

  return (
    <div className="bg-cblack min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow px-6 py-16">
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-5xl font-semibold mb-12 text-center">
            Devlog
          </h1>

          <div className="relative pl-8 space-y-12">
            {/* White vertical line */}
            <div className="absolute top-10 bottom-10 left-[45px] w-[2px] bg-white"></div>

            {devlogEntries.map(({ date, title, description }) => (
              <div key={date} className="relative pl-10">
                {/* White dot bisecting the line */}
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-white"></span>

                <time className="block text-white text-sm mb-1">{date}</time>
                <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
                <p className="text-grey">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-full bg-azul text-white hover:opacity-80 transition"
            >
              Join MNClubConnect
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
