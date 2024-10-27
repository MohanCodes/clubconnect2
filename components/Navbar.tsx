import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className='sticky top-0 z-10 bg-cblack'>
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-4">
          <img src="/circles.svg" alt="Logo" className="h-10" />
          <span className="text-2xl font-bold text-white">
            Club<span className="text-azul">Connect</span>
          </span>
        </Link>
        
        <div className="flex items-center space-x-10 text-lg">
          <Link href="/about" className="text-white hover:text-azul">About</Link>
          <Link href="/blog" className="text-white hover:text-azul">Blog</Link>
          <Link href="/calendar" className="text-white hover:text-azul">Calendar</Link>  
          <Link href="/signup" className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">Signup</Link>
        </div>
      </div>
    </nav>
  )
}