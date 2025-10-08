import React from 'react';
import { Loader } from './Loader';

interface FullScreenLoaderProps {
  message: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message }) => {
  return (
    <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center text-center text-gray-700">
      <Loader />
      <p className="mt-4 font-medium text-lg">{message}</p>
    </div>
  );
};