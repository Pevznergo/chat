'use client';

import { useRef, useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { generateShortLink, generateShortLinks, getInvites, deleteInvite, updateInvite } from './actions';
import { toDataURL } from 'qrcode';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns'; // Make sure date-fns is installed or use native

export default function StickerPage() {
  const [links, setLinks] = useState<string[]>([]);
  const [count, setCount] = useState(24);
  const [note, setNote] = useState('');
  const [customTitle, setCustomTitle] = useState('ЧАТ СОСЕДЕЙ🏠');
  const [customFeatures, setCustomFeatures] = useState('КОЛЕСО ПРИЗОВ:');
  const [customSubtitle, setCustomSubtitle] = useState('WB/OZON/iPhone');
  const [loading, setLoading] = useState(false);

  // Management state
  const [inviteList, setInviteList] = useState<any[]>([]);

  const loadInvites = async () => {
      try {
          const list = await getInvites(50);
          setInviteList(list);
      } catch (e) {
          console.error("Failed to load invites", e);
      }
  };

  // Load invites on mount
  useEffect(() => {
    loadInvites();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        // Auto-generate note from sticker text if empty (for UTM campaign)
        const effectiveNote = note.trim() 
            ? note.trim() 
            : `${customTitle} ${customFeatures}`.trim().slice(0, 50); // specific text of the advertisement

        const newLinks = await generateShortLinks(count, effectiveNote);
        setLinks(newLinks);
        await loadInvites(); // Refresh list
    } catch (e) {
      console.error(e);
      alert('Failed to generate links');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('Are you sure?')) return;
      await deleteInvite(id);
      await loadInvites();
  };

  // Font scaling helper
  const getFontSize = (text: string, type: 'title' | 'features' | 'prizes') => {
      const len = text.length;
      switch (type) {
          case 'title':
              if (len > 25) return '11px';
              if (len > 20) return '12px';
              if (len > 15) return '13px';
              return '15px'; // Base
          case 'features':
              if (len > 30) return '9px';
              if (len > 20) return '10px';
              return '11px'; // Base
          case 'prizes':
              if (len > 35) return '9px';
              if (len > 25) return '11px';
              if (len > 18) return '12px';
              return '13px'; // Base
          default:
              return '12px';
      }
  };

  const generateStickerHtml = async (link: string) => {
      const qrData = await toDataURL(link, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
      });

      const titleSize = getFontSize(customTitle, 'title');
      const featuresSize = getFontSize(customFeatures, 'features');
      const prizesSize = getFontSize(customSubtitle, 'prizes');

      return `
        <div class="sticker">
            <div class="sticker-inner">
                <div class="qr-box">
                    <img src="${qrData}" alt="QR" />
                </div>
                <div class="content-box">
                    <h1 class="main-title" style="font-size: ${titleSize}">
                        <svg class="tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                        </svg>
                        ${customTitle}
                    </h1>
                    <div class="features" style="font-size: ${featuresSize}">
                    ${customFeatures}
                    </div>
                    <div class="prizes" style="font-size: ${prizesSize}">
                        ${customSubtitle}
                    </div>
                </div>
            </div>
        </div>
      `;
  };

  const handlePrint = async () => {
    // Collect links to print
    const linksToPrint = links; // Only print newly generated or selected
    if (linksToPrint.length === 0) {
        alert("Generate links first!");
        return;
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
                    /* font-size: 15px; Removed base size to allow inline override */
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
                    /* font-size: 11px; Removed base size */
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
                    /* font-size: 13px; Removed base size */
                    font-weight: 900;
                    color: black;
                    text-transform: uppercase;
                    margin-top: 1mm; /* Tighten up */
                    margin-left: 1mm;
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
     // Dynamic font sizes for preview
     const titleSize = getFontSize(customTitle, 'title');
     const featuresSize = getFontSize(customFeatures, 'features');
     const prizesSize = getFontSize(customSubtitle, 'prizes');

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
                    /* font-size handled inline */
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
                    /* font-size handled inline */
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
                    /* font-size handled inline */
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
                      <Loader2 className="size-8 text-gray-400" />
                   </div>
                   <div className="preview-content-box">
                       <h1 className="preview-main-title" style={{ fontSize: titleSize }}>
                           <svg className="preview-tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                           </svg>
                           {customTitle}
                       </h1>
                       <div className="preview-features" style={{ fontSize: featuresSize }}>
                        {customFeatures}
                       </div>
                       <div className="preview-prizes" style={{ fontSize: prizesSize }}>
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Sticker Generator</h1>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Quantity to Generate</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[count]}
                                onValueChange={(v) => setCount(v[0])}
                                min={24}
                                max={240}
                                step={24}
                                className="flex-1"
                            />
                            <span className="w-12 text-right font-mono font-medium">{count}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Multiples of 24 recommended (full A4 sheet).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Batch Note / Location (Optional)</Label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. 'Entrance B', 'Summer Promo'"
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Generate {count} Unique Codes
                    </Button>

                    {links.length > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm flex justify-between items-center">
                            <span>Ready to print {links.length} stickers.</span>
                            <Button onClick={handlePrint} variant="outline" size="sm">
                                🖨️ Print Now
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                     <h3 className="font-semibold text-lg">Sticker Text</h3>
                     <div className="space-y-2">
                        <Label>Title (Main)</Label>
                        <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label>Features (Middle Text)</Label>
                        <Input value={customFeatures} onChange={(e) => setCustomFeatures(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label>Subtitle (Prizes)</Label>
                        <Input value={customSubtitle} onChange={(e) => setCustomSubtitle(e.target.value)} />
                     </div>
                </div>
            </div>

            <div className="space-y-4">
                 <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Live Preview</h2>
                 <p className="text-xs text-muted-foreground">This is how one sticker will look on A4.</p>
                 <StickerPreview />
            </div>
          </div>
        </div>

        {/* Management Table */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold mb-4">Generated Codes Statistics</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Note / Location</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Scans/Clicks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inviteList.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell className="font-mono">{invite.code}</TableCell>
                            <TableCell>{invite.note || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(invite.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {invite.used_count}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(invite.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {inviteList.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No stickers generated yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
