"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, X, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

interface Contributor {
  id: string;
  personId: string;
  role: 'TRANSLATOR' | 'EDITOR' | 'PROOFREADER';
  person: {
    id: string;
    nameHanzi: string | null;
    nameLatin: string;
    slug: string | null;
    avatarPath: string | null;
  };
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string | null;
}

interface SeriesContributorsTabProps {
  seriesId: string;
}

export function SeriesContributorsTab({ seriesId }: SeriesContributorsTabProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newContributor, setNewContributor] = useState({ personId: '', role: 'TRANSLATOR', episodeId: '' });

  const fetchContributors = async () => {
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/contributors`);
      if (res.ok) {
        const data = await res.json();
        setContributors(data);
      }
    } catch (err) {
      console.error('Failed to fetch contributors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContributor = async () => {
    if (!newContributor.personId || !newContributor.episodeId) return;
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/contributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContributor),
      });
      if (res.ok) {
        const data = await res.json();
        setContributors([...contributors, data]);
        setNewContributor({ personId: '', role: 'TRANSLATOR', episodeId: '' });
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to add contributor:', err);
    }
  };

  const handleRemoveContributor = async (id: string) => {
    if (!confirm('Remove this contributor?')) return;
    try {
      const res = await fetch(`/api/admin/contributors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContributors(contributors.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to remove contributor:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-body text-lg font-medium text-ink">Contributors</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Contributor
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/60 border border-ink/10 rounded-md p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={newContributor.episodeId}
              onChange={e => setNewContributor({ ...newContributor, episodeId: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            >
              <option value="">Select Episode</option>
            </select>
            <select
              value={newContributor.personId}
              onChange={e => setNewContributor({ ...newContributor, personId: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            >
              <option value="">Select Person</option>
            </select>
            <select
              value={newContributor.role}
              onChange={e => setNewContributor({ ...newContributor, role: e.target.value as 'TRANSLATOR' | 'EDITOR' | 'PROOFREADER' })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            >
              <option value="TRANSLATOR">Translator</option>
              <option value="EDITOR">Editor</option>
              <option value="PROOFREADER">Proofreader</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setIsAdding(false); setNewContributor({ personId: '', role: 'TRANSLATOR', episodeId: '' }); }}
              className="rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              onClick={handleAddContributor}
              className="rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brass mx-auto" />
        </div>
      ) : contributors.length === 0 ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
          <MoreHorizontal className="h-12 w-12 mx-auto text-ink/20 mb-4" />
          <p className="text-ink/50">No contributors yet. Click &ldquo;Add Contributor&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="bg-white/60 border border-ink/10 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink/5 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Episode</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {contributors.map((contributor) => (
                <tr key={contributor.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {contributor.person.avatarPath ? (
                        <img src={`/media/${contributor.person.avatarPath}`} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-ink-raised flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-ink/30" />
                        </div>
                      )}
                      <div>
                        <p className="font-body text-sm font-medium text-ink">{contributor.person.nameHanzi || contributor.person.nameLatin}</p>
                        {contributor.person.nameHanzi && contributor.person.nameLatin && (
                          <p className="font-body text-xs text-ink/50">{contributor.person.nameLatin}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-ink capitalize">{contributor.role.toLowerCase()}</td>
                  <td className="px-4 py-3 font-body text-sm text-ink/60">
                    Ep. {contributor.episodeNumber}: {contributor.episodeTitle || 'Untitled'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveContributor(contributor.id)}
                      className="text-ink/40 hover:text-plum transition-colors"
                      aria-label="Remove contributor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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