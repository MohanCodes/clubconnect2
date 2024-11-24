import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Adjust the import according to your project structure

interface TransferOwnershipProps {
    clubId: string;
    currentCreatorId: string;
    newOwnerId: string;
}

const TransferOwnership: React.FC<TransferOwnershipProps> = ({ clubId, currentCreatorId, newOwnerId }) => {
    const [errorMessage, setErrorMessage] = useState<string>('');

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

            const updatedEditors = addedEditors.filter(editor => editor !== newOwnerId);
            
            updatedEditors.push(currentCreatorId);
    

            await updateDoc(clubRef, {
                creatorId: newOwnerId,
                addedEditors: updatedEditors
            });
    
            alert('Ownership transferred successfully!');
        } catch (error) {
            console.error('Error transferring ownership:', error);
            setErrorMessage('Failed to transfer ownership. Please try again.');
        }
    }, [clubId, currentCreatorId, newOwnerId]);

    return (
        <div>
            <button onClick={handleTransferOwnership} className="bg-azul text-white px-2 py-1 rounded">
                Transfer Ownership
            </button>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </div>
    );
};

export default TransferOwnership;