import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'));
const UnderDevelopment = dynamic(() => import('@/components/UnderDevelopment'));

export default function About() {
  return (
    <div className="bg-cblack">
      <Navbar />
      <main role="main">
        <UnderDevelopment />
      </main>
    </div>
  )
}
