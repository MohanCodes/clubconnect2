import Image from 'next/image'
import Link from 'next/link'
import Tile from '@/components/Tile'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-20">
        <div className='max-w-lg flex flex-col justify-center h-screen items-center'>
          <div className='font-semibold text-white text-5xl'>
            <span className='text-azul'>Connect</span> with your club community.
          </div>
          <p className="text-xl my-6 text-center text-grey">
            Currently a club database for students located in the west metro.
          </p>
          <div className="space-x-4 border-blue-500 pt-4 flex flex-row">
            <input
              type="text"
              placeholder="Wayzata CSC"
              className="px-5 py-3 rounded-full border-none outline-none w-96 text-gray-700"
            />
            <button className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
              Search
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-full">
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
            { platform: 'discord', url: 'https://discord.com/invite/devclub' },
            { platform: 'tiktok', url: 'https://tiktok.com/@devclub' }
          ]}
        />
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
            { platform: 'discord', url: 'https://discord.com/invite/devclub' },
            { platform: 'tiktok', url: 'https://tiktok.com/@devclub' }
          ]}
        />
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
            { platform: 'discord', url: 'https://discord.com/invite/devclub' },
            { platform: 'tiktok', url: 'https://tiktok.com/@devclub' }
          ]}
        />
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
            { platform: 'discord', url: 'https://discord.com/invite/devclub' },
            { platform: 'tiktok', url: 'https://tiktok.com/@devclub' }
          ]}
        />
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'linkedin', url: 'https://linkedin.com/company/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
            { platform: 'discord', url: 'https://discord.com/invite/devclub' },
            { platform: 'tiktok', url: 'https://tiktok.com/@devclub' }
          ]}
        />
        <Tile
          icon="circles.svg"
          clubName="Developer Club"
          description="A club for developers, designers, and tech enthusiasts."
          tags={['Coding', 'Development', 'Tech']}
          links={[
            { platform: 'twitter', url: 'https://twitter.com/devclub' },
            { platform: 'github', url: 'https://github.com/devclub' },
            { platform: 'website', url: 'https://devclub.com' }, // Personal website
          ]}
        />
        </div>
      </main>
    </div>
  )
}
