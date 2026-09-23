"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, Edit, Loader2, Video } from 'lucide-react';

interface Episode {
  id: string;
  number: number;
  title: string | null;
  slug: string | null;
  durationMs: number | null;
  isPublished: boolean;
}

interface SeriesEpisodesTabProps {
  seriesId: string;
  episodes: Episode[];
}

export function SeriesEpisodesTab({ seriesId, episodes }: SeriesEpisodesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEpisode, setNewEpisode] = useState({ number: '', title: '' });

  const handleAddEpisode = async () => {
    if (!newEpisode.number || !newEpisode.title) return;
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(newEpisode.number),
          title: newEpisode.title,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to add episode:', err);
    }
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/episodes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !current }),
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDeleteEpisode = async (id: string, title: string) => {
    if (!confirm(`Delete episode "${title || id}"?`)) return;
    try {
      const res = await fetch(`/api/admin/episodes/${id}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error('Failed to delete episode:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-body text-lg font-medium text-ink">Episodes</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Episode
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/60 border border-ink/10 rounded-md p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              placeholder="Episode Number"
              value={newEpisode.number}
              onChange={e => setNewEpisode({ ...newEpisode, number: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              min="1"
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={newEpisode.title}
              onChange={e => setNewEpisode({ ...newEpisode, title: e.target.value })}
              className="col-span-2 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setIsAdding(false); setNewEpisode({ number: '', title: '' }); }}
              className="rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEpisode}
              className="rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {episodes.length === 0 ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
          <Video className="h-12 w-12 mx-auto text-ink/20 mb-4" />
          <p className="text-ink/50">No episodes yet. Click "Add Episode" to get started.</p>
        </div>
      ) : (
        <div className="bg-white/60 border border-ink/10 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink/5 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 w-32">Duration</th>
                <th className="px-4 py-3 w-28">Status</th>
                <th className="px-4 py-3 w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {episodes.map((ep) => (
                <tr key={ep.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-body text-sm text-ink/60">{ep.number}</td>
                  <td className="px-4 py-3 font-body text-sm text-ink">{ep.title || 'Untitled'}</td>
                  <td className="px-4 py-3 font-body text-sm text-ink/50">
                    {ep.durationMs ? `${Math.floor(ep.durationMs / 60000)}:${String(Math.floor((ep.durationMs % 60000) / 1000)).padStart(2, '0')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(ep.id, ep.isPublished)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ep.isPublished
                          ? 'bg-emerald/10 text-emerald'
                          : 'bg-ink/10 text-ink/60'
                      }`}
                    >
                      {ep.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/series/${seriesId}/episodes/${ep.id}`}
                        className="text-ink/60 hover:text-brass transition-colors"
                        aria-label="View episode"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/series/${seriesId}/episodes/${ep.id}/edit`}
                        className="text-ink/60 hover:text-brass transition-colors"
                        aria-label="Edit episode"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEpisode(ep.id, ep.title || '')}
                        className="text-ink/40 hover:text-plum transition-colors"
                        aria-label="Delete episode"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}