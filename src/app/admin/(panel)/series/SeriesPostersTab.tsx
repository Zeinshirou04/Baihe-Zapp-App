"use client";
import { useState } from 'react';
import { Plus, Trash2, Check, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface Poster {
  id: string;
  path: string;
  isThumb: boolean;
  createdAt: Date;
}

interface SeriesPostersTabProps {
  seriesSlug: string;
  posters: Poster[];
}

export function SeriesPostersTab({ seriesSlug, posters: initialPosters }: SeriesPostersTabProps) {
  const [posters, setPosters] = useState<Poster[]>(initialPosters);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/api/admin/series/${seriesSlug}/posters`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setPosters([data, ...posters]);
        }
}
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetThumbnail = async (posterId: string) => {
    try {
      const res = await fetch(`/api/admin/posters/${posterId}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesSlug }),
      });
      if (res.ok) {
        setPosters(posters.map(p => ({ ...p, isThumb: p.id === posterId })));
      }
    } catch (err) {
      console.error('Failed to set thumbnail:', err);
    }
  };

  const handleDelete = async (posterId: string) => {
    if (!confirm('Delete this poster?')) return;
    try {
      const res = await fetch(`/api/admin/posters/${posterId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosters(posters.filter(p => p.id !== posterId));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected posters?`)) return;
    try {
      const res = await fetch(`/api/admin/series/${seriesSlug}/posters/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setPosters(posters.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-body text-lg font-medium text-ink">Posters</h2>
        <label className="inline-flex items-center gap-2 rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors cursor-pointer">
          <Plus className="h-4 w-4" />
          Upload Posters
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-brass/10 border border-brass/20 rounded-md px-4 py-2 flex items-center justify-between">
          <span className="font-body text-sm text-brass">{selectedIds.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="text-plum hover:text-plum/80 font-medium text-sm"
          >
            <Trash2 className="h-4 w-4 inline mr-1" /> Delete Selected
          </button>
        </div>
      )}

      {posters.length === 0 ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-ink/20 mb-4" />
          <p className="text-ink/50">No posters yet. Click &ldquo;Upload Posters&rdquo; to add images.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className={`relative bg-white/60 border border-ink/10 rounded-md overflow-hidden ${
                selectedIds.includes(poster.id) ? 'ring-2 ring-brass' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(poster.id)}
                onChange={() => toggleSelect(poster.id)}
                className="absolute top-2 left-2 z-10 h-4 w-4 text-brass border-ink/30 rounded focus:ring-brass"
              />
              <div className="aspect-[2/3] relative overflow-hidden">
                <Image src={`/media/${poster.path}`} alt="" fill className="object-cover" sizes="100vw" />
                {poster.isThumb && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-brass rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Thumbnail
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 flex items-center justify-between">
                <button
                  onClick={() => handleSetThumbnail(poster.id)}
                  disabled={poster.isThumb}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    poster.isThumb
                      ? 'bg-brass/10 text-brass cursor-default'
                      : 'bg-white text-ink/60 hover:bg-brass/10 hover:text-brass'
                  }`}
                >
                  {poster.isThumb ? (
                    <>
                      <Check className="h-3 w-3 inline mr-1" />
                      Thumbnail Set
                    </>
                  ) : (
                    'Set as Thumbnail'
                  )}
                </button>
                <button
                  onClick={() => handleDelete(poster.id)}
                  className="text-ink/40 hover:text-plum transition-colors"
                  aria-label="Delete poster"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}