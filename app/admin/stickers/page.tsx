'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { generateShortLink, generateShortLinks } from './actions';
import { Switch } from '@/components/ui/switch';
import QRCodeLib from 'qrcode';
import { Loader2 } from 'lucide-react';

export default function AdminStickersPage() {
  const [url, setUrl] = useState('https://aporto.tech');
  const [batchLinks, setBatchLinks] = useState<string[]>([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [batchCount, setBatchCount] = useState(24);
  const [customTitle, setCustomTitle] = useState('ЧАТ СОСЕДЕЙ🏠');
  const [customSubtitle, setCustomSubtitle] = useState('WB/OZON/iPhone');
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      if (mode === 'single') {
        const newLink = await generateShortLink();
        setUrl(newLink);
      } else {
        const links = await generateShortLinks(batchCount);
        setBatchLinks(links);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate link(s)');
    } finally {
        setLoading(false);
    }
  };

  const generateStickerHtml = async (link: string) => {
      const qrData = await QRCodeLib.toDataURL(link, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
      });

      return `
        <div class="sticker">
            <div class="sticker-inner">
                <div class="qr-box">
                    <img src="${qrData}" alt="QR" />
                </div>
                <div class="content-box">
                    <h1 class="main-title">
                        <svg class="tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                        </svg>
                        ${customTitle}
                    </h1>
                    <div class="features">
                    КОЛЕСО ПРИЗОВ:
                    </div>
                    <div class="prizes">
                        ${customSubtitle}
                    </div>
                </div>
            </div>
        </div>
      `;
  };

  const handlePrint = async () => {
    // Collect links to print
    let linksToPrint: string[] = [];
    if (mode === 'single') {
        linksToPrint = Array(24).fill(url); // Fill a page if single
    } else {
        linksToPrint = batchLinks;
        if (linksToPrint.length === 0) {
            alert("No batch links generated yet.");
            return;
        }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Не удалось открыть окно печати. Разрешите всплывающие окна.");
        return;
    }

    // Chunk into pages of 24 (3 cols * 8 rows)
    const PAGESIZE = 24;
    const pages = [];
    for (let i = 0; i < linksToPrint.length; i += PAGESIZE) {
        pages.push(linksToPrint.slice(i, i + PAGESIZE));
    }

    let fullHtml = '';
    for (const pageItems of pages) {
        let stickersHtml = '';
        for (const link of pageItems) {
            try {
                stickersHtml += await generateStickerHtml(link);
            } catch (err) {
                console.error(`Failed to generate QR for ${link}`, err);
            }
        }
        fullHtml += `<div class="page">${stickersHtml}</div>`;
    }

    printWindow.document.write(`
        <html>
        <head>
            <title>Печать наклеек A4 (70x37mm)</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    color: black;
                    -webkit-print-color-adjust: exact;
                }
                .page {
                    width: 210mm;
                    height: 297mm;
                    display: grid;
                    grid-template-columns: repeat(3, 70mm);
                    grid-template-rows: repeat(8, 37.125mm); /* 297/8 = 37.125 */
                    position: relative;
                    overflow: hidden;
                    page-break-after: always;
                }
                .sticker {
                    box-sizing: border-box;
                    width: 70mm;
                    height: 37mm;
                    padding: 4mm 2mm;
                    overflow: hidden;
                }
                .sticker-inner {
                    display: flex;
                    gap: 2mm;
                    height: 100%;
                    align-items: center;
                }
                .qr-box {
                    width: 25mm;
                    flex-shrink: 0;
                }
                .qr-box img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .content-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    text-align: left;
                }
                .main-title {
                    margin: 0;
                    padding: 0;
                    font-size: 15px; /* Maximized */
                    font-weight: 900;
                    line-height: 1;
                    text-transform: uppercase;
                    margin-bottom: 1mm; /* Reduced spacing */
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 1mm;
                    padding-left: 1mm; /* Indent */
                }
                .tg-icon {
                    width: 4.5mm;
                    height: 4.5mm;
                    flex-shrink: 0;
                }
                .features {
                    font-size: 11px; /* Maximized */
                    font-weight: 700;
                    color: #000;
                    background: #eee;
                    padding: 0.5mm 1.5mm;
                    border-radius: 2mm;
                    width: fit-content;
                    margin-bottom: 0.5mm; /* Reduce gap to prizes */
                    margin-left: 1mm; /* Indent */
                    text-transform: uppercase;
                }
                .prizes {
                    font-family: 'Arial Black', Gadget, sans-serif;
                    font-size: 13px;
                    font-weight: 900;
                    color: black;
                    text-transform: uppercase;
                    margin-top: 1mm; /* Tighten up */
                    margin-left: 1mm; /* Indent */
                    line-height: 1;
                }
                @media print {
                    .no-print { display: none; }
                    .sticker { border: none; }
                    .features { -webkit-print-color-adjust: exact; background: #eee; }
                }
            </style>
        </head>
        <body>
            ${fullHtml}
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
  };

  // Preview Component
  const StickerPreview = () => {
     // Use a ref or effect to generate QR for preview would be ideal, 
     // but for simplicity let's use the react-qr-code component we already have or just CSS for now.
     // To match EXACTLY, we should try to reuse styles. 
     // We can inject a style tag for the preview container.
     
     return (
        <div className="border rounded-lg p-8 bg-gray-100 flex justify-center">
            <style dangerouslySetInnerHTML={{__html: `
                .preview-sticker {
                    box-sizing: border-box;
                    width: 70mm;
                    height: 37mm;
                    padding: 4mm 2mm;
                    background: white;
                    border: 1px dashed #ccc;
                    overflow: hidden;
                }
                .preview-sticker-inner {
                    display: flex;
                    gap: 2mm;
                    height: 100%;
                    align-items: center;
                }
                .preview-qr-box {
                    width: 25mm;
                    flex-shrink: 0;
                    background: #eee; /* Placeholder */
                }
                .preview-content-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    text-align: left;
                }
                .preview-main-title {
                    margin: 0;
                    padding: 0;
                    font-size: 15px; 
                    font-weight: 900;
                    line-height: 1;
                    text-transform: uppercase;
                    margin-bottom: 1mm;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 1mm;
                    padding-left: 1mm;
                    color: black;
                }
                .preview-tg-icon {
                    width: 4.5mm;
                    height: 4.5mm;
                    flex-shrink: 0;
                }
                .preview-features {
                    font-size: 11px;
                    font-weight: 700;
                    color: #000;
                    background: #eee;
                    padding: 0.5mm 1.5mm;
                    border-radius: 2mm;
                    width: fit-content;
                    margin-bottom: 0.5mm;
                    margin-left: 1mm;
                    text-transform: uppercase;
                }
                .preview-prizes {
                    font-family: 'Arial Black', Gadget, sans-serif;
                    font-size: 13px;
                    font-weight: 900;
                    color: black;
                    text-transform: uppercase;
                    margin-top: 1mm;
                    margin-left: 1mm;
                    line-height: 1;
                }
            `}} />
            
            <div className="preview-sticker">
               <div className="preview-sticker-inner">
                   <div className="preview-qr-box flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-gray-400" />
                   </div>
                   <div className="preview-content-box">
                       <h1 className="preview-main-title">
                           <svg className="preview-tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                           </svg>
                           {customTitle}
                       </h1>
                       <div className="preview-features">
                        КОЛЕСО ПРИЗОВ:
                       </div>
                       <div className="preview-prizes">
                           {customSubtitle}
                       </div>
                   </div>
               </div>
            </div>
        </div>
     );
  };


  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Sticker Generator</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Switch 
                    id="mode" 
                    checked={mode === 'batch'}
                    onCheckedChange={(c) => setMode(c ? 'batch' : 'single')}
                    />
                    <Label htmlFor="mode" className="text-lg font-medium">
                        {mode === 'batch' ? 'Batch (Unique Codes)' : 'Single (Same URL)'}
                    </Label>
                </div>

                {mode === 'single' ? (
                    <div className="space-y-2">
                        <Label htmlFor="url">Target URL</Label>
                        <div className="flex gap-2">
                            <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            />
                            <Button onClick={handleGenerateLink} variant="outline" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'New Code'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Batch Count: {batchCount}</Label>
                            <Slider
                                value={[batchCount]}
                                onValueChange={(v) => setBatchCount(v[0])}
                                min={24}
                                max={240}
                                step={24}
                            />
                            <p className="text-sm text-muted-foreground">
                                Will generate {batchCount} unique links.
                            </p>
                        </div>
                        
                        <Button 
                            onClick={handleGenerateLink} 
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Generate {batchCount} Unique Links
                        </Button>

                        {batchLinks.length > 0 && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
                                Generated {batchLinks.length} unique links.
                            </div>
                        )}
                    </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                     <h3 className="font-semibold text-lg">Sticker Text</h3>
                     <div className="space-y-2">
                        <Label>Title (Main)</Label>
                        <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label>Subtitle (Prizes)</Label>
                        <Input value={customSubtitle} onChange={(e) => setCustomSubtitle(e.target.value)} />
                     </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handlePrint} size="lg" className="w-full text-lg h-16">
                    🖨️ Print Stickers
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                 <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Live Preview</h2>
                 <p className="text-xs text-muted-foreground">This is how one sticker will look on A4.</p>
                 <StickerPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
