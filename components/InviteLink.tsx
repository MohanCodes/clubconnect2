'use client';

import { ReactNode, useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface InviteLinkProps {
  children: ReactNode; // text or elements between <InviteLink> ... </InviteLink>
}

export default function InviteLink({ children }: InviteLinkProps) {
  const [senderName, setSenderName] = useState<string>(''); // will hold user name

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // Pull name from Firestore "users" doc
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSenderName(data.name || user.displayName || '');
        } else {
          setSenderName(user.displayName || '');
        }
      } catch (err) {
        console.error('Error fetching user name for InviteLink:', err);
      }
    });

    return () => unsub();
  }, []);

  const handleClick = () => {
    const subject = encodeURIComponent('Thought this might help the club');
    const body = encodeURIComponent(
        `Hey there,\n\n` +
        `I was thinking our club could maybe benefit from using MNClubConnect to keep everyone in the loop and make sharing events easier.\n` +
        `You can check it out here: https://mnclubconnect.com/signup\n\n` +
        `Might be worth a try so things are easier for you guys.\n\n` +
        `Best,\n${senderName || '[Your Name]'}`
    );
      

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-azul hover:underline"
    >
      {children}
    </button>
  );
}
