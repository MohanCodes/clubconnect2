import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/firebase'; // Adjust the import according to your project structure

interface TransferOwnershipProps {
    clubId: string;
    currentCreatorId: string;
    newOwnerId: string;
}

const TransferOwnership: React.FC<TransferOwnershipProps> = ({ clubId, currentCreatorId, newOwnerId }) => {
    const [errorMessage, setErrorMessage] = useState<string>('');
    const router = useRouter();

    const handleTransferOwnership = useCallback(async () => {
        try {
            const clubRef = doc(db, 'clubs', clubId);
            // Fetch the current data
            const clubSnapshot = await getDoc(clubRef);
            if (!clubSnapshot.exists()) {
                throw new Error('Club not found');
            }
    
            const clubData = clubSnapshot.data();
            const addedEditors: string[] = clubData.addedEditors || [];
    
            // Create a new array of editors excluding the current creator
            const updatedEditors = addedEditors.filter(editor => editor !== currentCreatorId);
    
            // Add the new owner to the editors list
            updatedEditors.push(newOwnerId);
    
            // Update the document with new creator ID and updated editors
            await updateDoc(clubRef, {
                creatorId: newOwnerId,
                addedEditors: updatedEditors
            });
    
            alert('Ownership transferred successfully!');
        } catch (error) {
            console.error('Error transferring ownership:', error);
            setErrorMessage('Failed to transfer ownership. Please try again.');
        }
    }, [clubId, currentCreatorId, newOwnerId, router]);

    return (
        <div>
            <button onClick={handleTransferOwnership} className="bg-azul text-white px-2 py-1 rounded text-sm">
                Transfer Ownership
            </button>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </div>
    );
};

export default TransferOwnership;