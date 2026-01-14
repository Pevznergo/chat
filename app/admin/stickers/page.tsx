'use client';

import React, { useState } from 'react';
import { StickerGenerator } from '@/components/admin/sticker-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { generateShortLink } from './actions';

export default function AdminStickersPage() {
  const [url, setUrl] = useState('https://aporto.tech');
  const [title, setTitle] = useState('SCAN ME');
  const [bottomText, setBottomText] = useState('aporto.tech');
  const [size, setSize] = useState(128);
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(4);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateLink = async () => {
    try {
      const newLink = await generateShortLink();
      setUrl(newLink);
    } catch (e) {
      console.error(e);
      alert('Failed to generate link');
    }
  };

  // Generate an array for the grid
  const totalStickers = rows * cols;
  const stickers = Array.from({ length: totalStickers });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      {/* Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto space-y-8 print:hidden">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">QR Code Sticker Generator</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Target URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Button 
                  onClick={handleGenerateLink} 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2"
                >
                  Generate Unique Link
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Top Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SCAN ME"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottomText">Bottom Text</Label>
                <Input
                  id="bottomText"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="aporto.tech"
                />
              </div>

              <div className="space-y-2">
                 <Label>QR Size ({size}px)</Label>
                 <Slider
                    value={[size]}
                    onValueChange={(v) => setSize(v[0])}
                    min={64}
                    max={256}
                    step={8}
                  />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                 <Label>Grid Rows ({rows})</Label>
                 <Slider
                    value={[rows]}
                    onValueChange={(v) => setRows(v[0])}
                    min={1}
                    max={8}
                    step={1}
                  />
              </div>
              <div className="space-y-2">
                 <Label>Grid Columns ({cols})</Label>
                 <Slider
                    value={[cols]}
                    onValueChange={(v) => setCols(v[0])}
                    min={1}
                    max={6}
                    step={1}
                  />
              </div>
               <div className="pt-4">
                <Button onClick={handlePrint} className="w-full">
                  Print Stickers
                </Button>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 text-center">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Preview</h2>
            <div className="inline-block border border-dashed border-gray-300 p-4">
                <StickerGenerator
                    url={url}
                    title={title}
                    bottomText={bottomText}
                    size={size}
                />
            </div>
        </div>
      </div>

      {/* Printable Grid - Only Visible on Print */}
      <div className="hidden print:block absolute inset-0 bg-white p-0 m-0">
        <div 
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${gap}mm`,
          }}
        >
          {stickers.map((_, i) => (
            <div key={i} className="flex justify-center items-center p-2 break-inside-avoid">
              <StickerGenerator
                url={url}
                title={title}
                bottomText={bottomText}
                size={size}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
