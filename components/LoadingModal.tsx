import React from 'react';
import { FaCircleNotch } from 'react-icons/fa';

interface LoadingModalProps {
    loadingMessage: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ loadingMessage }) => {
    return (
        <div className="fixed inset-0 bg-cblack flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
                <p className="mt-4 text-azul font-semibold">{loadingMessage}</p>
            </div>
        </div>
    );
};

export default LoadingModal;