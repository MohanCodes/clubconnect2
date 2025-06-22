"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import {
  MDXEditor,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  imagePlugin,
  frontmatterPlugin,
  markdownShortcutPlugin,
  diffSourcePlugin,
  directivesPlugin,
  sandpackPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  InsertImage,
  ListsToggle,
  CodeToggle,
  Separator,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { User } from 'firebase/auth';
import { nanoid } from 'nanoid';

interface ClubInfo {
  id: string;
  creatorId: string;
  addedEditors?: string[];
  name: string;
}

export default function EditBlogPage() {
  const { blogId } = useParams();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('clubId') || '';
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);

  useEffect(() => {
    // Fetch user (assume firebase auth is available globally)
    import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (u: User | null) => setUser(u));
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (blogId === 'new' && clubId) {
        // Fetch club info for permission check
        const clubRef = doc(db, 'clubs', clubId);
        const clubSnap = await getDoc(clubRef);
        if (clubSnap.exists()) {
          const data = clubSnap.data();
          setClubInfo({
            id: clubSnap.id,
            creatorId: data.creatorId,
            name: data.name,
            addedEditors: data.addedEditors || [],
          });
        } else {
          setClubInfo(null);
        }
        setLoading(false);
        return;
      }
      if (!blogId || typeof blogId !== 'string') {
        setError('Invalid blog ID.');
        setLoading(false);
        return;
      }
      // Existing blog
      try {
        const blogRef = doc(db, 'blogs', blogId);
        const blogSnap = await getDoc(blogRef);
        if (blogSnap.exists()) {
          const data = blogSnap.data();
          setTitle(data.title);
          setContent(data.content);
          if (data.clubId) {
            const clubSnap = await getDoc(doc(db, 'clubs', data.clubId));
            if (clubSnap.exists()) {
              const clubData = clubSnap.data();
              setClubInfo({
                id: clubSnap.id,
                creatorId: clubData.creatorId,
                name: clubData.name,
                addedEditors: clubData.addedEditors || [],
              });
            } else {
              setClubInfo(null);
            }
          }
        } else {
          setError('Blog not found.');
        }
      } catch {
        setError('Failed to fetch blog.');
      }
      setLoading(false);
    }
    fetchData();
  }, [blogId, clubId]);

  // Permission check
  const canEdit = user && clubInfo && (clubInfo.creatorId === user.uid || (clubInfo.addedEditors && clubInfo.addedEditors.includes(user.uid)));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (blogId === 'new' && clubId && canEdit) {
        // Create new blog
        const newBlogId = nanoid(6);
        const newBlogRef = doc(db, 'blogs', newBlogId);
        await setDoc(newBlogRef, {
          title,
          content,
          date: new Date(),
          clubId,
          clubName: clubInfo.name,
        });
        // Add blogId to club
        await updateDoc(doc(db, 'clubs', clubId), {
          blogIds: arrayUnion(newBlogId),
        });
        router.push(`/blog/${newBlogId}`);
        return;
      }
      if (!blogId || typeof blogId !== 'string') {
        setError('Invalid blog ID.');
        setLoading(false);
        return;
      }
      // Update existing blog
      await updateDoc(doc(db, 'blogs', blogId), { title, content });
      router.push(`/blog/${blogId}`);
    } catch {
      setError('Failed to save changes.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (blogId === 'new') return router.back();
    if (!blogId || typeof blogId !== 'string') return;
    if (confirm('Delete this blog?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'blogs', blogId));
        if (clubInfo && clubInfo.id) {
          await updateDoc(doc(db, 'clubs', clubInfo.id), {
            blogIds: arrayUnion(blogId),
          });
        }
        router.push('/');
      } catch {
        setError('Failed to delete blog.');
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user || (clubInfo && (clubInfo.creatorId != user.uid && !clubInfo.addedEditors?.includes(user.uid)))) {
    if (blogId && blogId !== 'new') {
      router.push(`/blog/${blogId}`);
    } else {
      router.push(`/`);
    }
    return null;
  }

  return (
    <div className="bg-cblack min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h1 className="text-5xl font-bold text-white">Edit Blog</h1>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold">Save</button>
              <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">Cancel</button>
              {blogId !== 'new' && (
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Delete</button>
              )}
            </div>
          </div>
          <input
            className="w-full p-4 rounded bg-[#18181b] text-white border-none text-3xl font-bold placeholder-gray-500 focus:outline-none mb-4"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Blog Title"
          />
          <div className="mb-8 rounded overflow-hidden border border-[#232323]">
            <MDXEditor
              markdown={content}
              onChange={setContent}
              contentEditableClassName="prose prose-invert max-w-none min-h-[400px] bg-[#18181b] px-6 py-4 focus:outline-none"
              className="bg-[#18181b] border-none"
              plugins={[
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <Separator />
                      <BlockTypeSelect />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                      <Separator />
                      <InsertTable />
                      <Separator />
                      <InsertImage />
                      <Separator />
                      <CodeToggle />
                      <Separator />
                      <DiffSourceToggleWrapper>Source</DiffSourceToggleWrapper>
                    </>
                  )
                }),
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                linkPlugin(),
                tablePlugin(),
                codeBlockPlugin(),
                codeMirrorPlugin(),
                imagePlugin(),
                frontmatterPlugin(),
                markdownShortcutPlugin(),
                diffSourcePlugin(),
                directivesPlugin(),
                sandpackPlugin(),
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 