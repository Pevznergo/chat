'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface StickerProps {
  url: string;
  title?: string;
  bottomText?: string;
  size?: number;
}

export const StickerGenerator: React.FC<StickerProps> = ({
  url,
  title,
  bottomText,
  size = 128,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm print:border-none print:shadow-none"
      style={{ width: 'fit-content' }}
    >
      {title && (
        <div className="mb-2 text-sm font-bold text-center text-black uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="bg-white p-2">
        <QRCode value={url} size={size} />
      </div>
      {bottomText && (
        <div className="mt-2 text-xs font-medium text-center text-black">
          {bottomText}
        </div>
      )}
    </div>
  );
};
