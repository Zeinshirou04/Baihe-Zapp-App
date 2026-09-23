"use client";
import { useState } from 'react';
import { Plus, Trash2, GripVertical, UserPlus, X, Users } from 'lucide-react';
import { prisma } from '@/db/client';

interface CastMember {
  id: string;
  role: string;
  characterName: string | null;
  sortOrder: number;
  person: {
    id: string;
    nameHanzi: string | null;
    nameLatin: string;
    slug: string | null;
    avatarPath: string | null;
  };
}

interface SeriesActorsTabProps {
  seriesId: string;
  cast: CastMember[];
}

export function SeriesActorsTab({ seriesId, cast: initialCast }: SeriesActorsTabProps) {
  const [cast, setCast] = useState<CastMember[]>(initialCast);
  const [isAdding, setIsAdding] = useState(false);
  const [newActor, setNewActor] = useState({ personId: '', role: '', characterName: '' });

  const handleAddActor = async () => {
    if (!newActor.personId || !newActor.role) return;
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/cast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActor),
      });
      if (res.ok) {
        const data = await res.json();
        setCast([...cast, data]);
        setNewActor({ personId: '', role: '', characterName: '' });
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to add actor:', err);
    }
  };

  const handleRemoveActor = async (castId: string) => {
    if (!confirm('Remove this actor from the series?')) return;
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/cast/${castId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCast(cast.filter(c => c.id !== castId));
      }
    } catch (err) {
      console.error('Failed to remove actor:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-body text-lg font-medium text-ink">Cast</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Actor
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/60 border border-ink/10 rounded-md p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={newActor.personId}
              onChange={e => setNewActor({ ...newActor, personId: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            >
              <option value="">Select Person</option>
            </select>
            <input
              type="text"
              placeholder="Role (e.g., 主役)"
              value={newActor.role}
              onChange={e => setNewActor({ ...newActor, role: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
            <input
              type="text"
              placeholder="Character Name (optional)"
              value={newActor.characterName}
              onChange={e => setNewActor({ ...newActor, characterName: e.target.value })}
              className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setIsAdding(false); setNewActor({ personId: '', role: '', characterName: '' }); }}
              className="rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              onClick={handleAddActor}
              className="rounded-md bg-brass text-ink px-3 py-1.5 text-sm font-medium hover:bg-brass/80 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {cast.length === 0 ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-ink/20 mb-4" />
          <p className="text-ink/50">No cast members yet. Click "Add Actor" to get started.</p>
        </div>
      ) : (
        <div className="bg-white/60 border border-ink/10 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink/5 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Character</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {cast.map((member, index) => (
                <tr key={member.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 text-ink/40">
                    <GripVertical className="h-5 w-5 cursor-grab" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {member.person.avatarPath ? (
                        <img src={`/media/${member.person.avatarPath}`} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-ink-raised flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-ink/30" />
                        </div>
                      )}
                      <div>
                        <p className="font-body text-sm font-medium text-ink">{member.person.nameHanzi || member.person.nameLatin}</p>
                        {member.person.nameHanzi && member.person.nameLatin && (
                          <p className="font-body text-xs text-ink/50">{member.person.nameLatin}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-ink">{member.role}</td>
                  <td className="px-4 py-3 font-body text-sm text-ink/60">{member.characterName || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemoveActor(member.id)}
                      className="text-ink/40 hover:text-plum transition-colors"
                      aria-label="Remove actor"
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