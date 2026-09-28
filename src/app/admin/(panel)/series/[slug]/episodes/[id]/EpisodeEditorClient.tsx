"use client";

import { useState, useCallback } from 'react';
import { Save, Loader2, Trash2, Plus, GripVertical, Type, UserPlus, Users, ClipboardPaste, X } from 'lucide-react';
import { replaceEpisodeLines } from '@/actions/lines';

interface Line {
  id: string;
  idx: number;
  startMs: number;
  endMs: number | null;
  hanzi: string;
  pinyin: string;
  pinyinTokens: string;
  translationEn: string;
  speakerId: string | null;
}

interface Contributor {
  id: string;
  role: 'TRANSLATOR' | 'EDITOR' | 'PROOFREADER';
  person: {
    id: string;
    nameLatin: string;
    nameHanzi: string | null;
  };
}

interface EpisodeEditorClientProps {
  episode: {
    id: string;
    number: number;
    title: string | null;
    series: { slug: string; titleHanzi: string; id: string };
    lines: Line[];
    contributors: Contributor[];
  };
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [min, sec] = parts;
    return parseInt(min) * 60000 + Math.round(parseFloat(sec) * 1000);
  }
  if (parts.length === 3) {
    const [min, sec, ms] = parts;
    return parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(ms);
  }
  return 0;
}

export function EpisodeEditorClient({ episode }: EpisodeEditorClientProps) {
  const [lines, setLines] = useState<Line[]>(episode.lines);
  const [isSaving, setIsSaving] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'lines' | 'contributors'>('lines');
  const [contributors, setContributors] = useState<Contributor[]>(episode.contributors);
  const [isAddingContributor, setIsAddingContributor] = useState(false);
  const [newContributor, setNewContributor] = useState<{ personId: string; role: 'TRANSLATOR' | 'EDITOR' | 'PROOFREADER' }>({ personId: '', role: 'TRANSLATOR' });
  const [contributorError, setContributorError] = useState<string | null>(null);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [bulkPasteError, setBulkPasteError] = useState<string | null>(null);

  const addLine = useCallback(() => {
    const newIdx = lines.length > 0 ? Math.max(...lines.map(l => l.idx)) + 1 : 0;
    const newLine: Line = {
      id: `new-${Date.now()}`,
      idx: newIdx,
      startMs: 0,
      endMs: null,
      hanzi: '',
      pinyin: '',
      pinyinTokens: JSON.stringify([]),
      translationEn: '',
      speakerId: null,
    };
    setLines(prev => [...prev, newLine].sort((a, b) => a.idx - b.idx));
  }, [lines]);

  const updateLine = useCallback((id: string, field: keyof Line, value: string | number) => {
    setLines(prev => prev.map(line =>
      line.id === id ? { ...line, [field]: value } : line
    ));
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines(prev => prev.filter(line => line.id !== id));
  }, []);

  const parseBulkPaste = useCallback((text: string): Line[] => {
    const newLines: Line[] = [];
    const rawLines = text.trim().split('\n');
    
    rawLines.forEach((rawLine, index) => {
      const trimmed = rawLine.trim();
      if (!trimmed) return;
      
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length < 3) {
        throw new Error(`Line ${index + 1}: Expected format "timestamp | hanzi | translation" (got ${parts.length} parts)`);
      }
      
      const [timeStr, hanzi, translationEn] = parts;
      const startMs = parseTime(timeStr);
      if (isNaN(startMs)) {
        throw new Error(`Line ${index + 1}: Invalid timestamp "${timeStr}"`);
      }
      
      const newIdx = lines.length + newLines.length;
      newLines.push({
        id: `new-${Date.now()}-${index}`,
        idx: newIdx,
        startMs,
        endMs: null,
        hanzi,
        pinyin: '',
        pinyinTokens: JSON.stringify([]),
        translationEn,
        speakerId: null,
      });
    });
    
    return newLines;
  }, [lines]);

  const handleBulkPaste = () => {
    if (!bulkPasteText.trim()) {
      setBulkPasteError('Please paste transcript content');
      return;
    }
    setBulkPasteError(null);
    try {
      const parsedLines = parseBulkPaste(bulkPasteText);
      setLines(prev => [...prev, ...parsedLines].sort((a, b) => a.idx - b.idx));
      setShowBulkPaste(false);
      setBulkPasteText('');
    } catch (err) {
      setBulkPasteError(err instanceof Error ? err.message : 'Failed to parse transcript');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    const validLines = lines
      .filter(l => l.hanzi.trim() && l.translationEn.trim())
      .map((l) => ({
        startMs: l.startMs,
        endMs: l.endMs,
        hanzi: l.hanzi.trim(),
        translationEn: l.translationEn.trim(),
        speakerId: l.speakerId,
      }));

    try {
      await replaceEpisodeLines(episode.id, validLines);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save lines:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const contributorNames = episode.contributors.map(c => c.person.nameLatin).join(', ');

  const handleAddContributor = async () => {
    if (!newContributor.personId) {
      setContributorError('Please select a person');
      return;
    }
    setContributorError(null);
    try {
      const res = await fetch(`/api/admin/series/${episode.series.slug}/contributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: episode.id,
          personId: newContributor.personId,
          role: newContributor.role,
        }),
      });
      if (!res.ok) throw new Error('Failed to add contributor');
      const data = await res.json();
      setContributors(prev => [...prev, data]);
      setIsAddingContributor(false);
      setNewContributor({ personId: '', role: 'TRANSLATOR' });
    } catch (err) {
      console.error('Failed to add contributor:', err);
      setContributorError('Failed to add contributor');
    }
  };

  const handleRemoveContributor = async (contributorId: string) => {
    if (!confirm('Remove this contributor?')) return;
    try {
      const res = await fetch(`/api/admin/series/${episode.series.slug}/contributors/${contributorId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove contributor');
      setContributors(prev => prev.filter(c => c.id !== contributorId));
    } catch (err) {
      console.error('Failed to remove contributor:', err);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-sc text-2xl text-ink">
            {episode.series.titleHanzi} — Episode {episode.number}
          </h1>
          <p className="font-body text-sm text-ink/60 mt-1">
            {episode.title || 'Untitled'} {contributorNames && `· ${contributorNames}`}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-brass text-ink px-4 py-2 text-sm font-medium hover:bg-brass/80 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Lines'}
        </button>
      </header>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-white/60 border border-ink/10 rounded-md p-1">
        <button
          onClick={() => setActiveTab('lines')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'lines'
              ? 'bg-brass text-ink'
              : 'text-ink/60 hover:text-ink hover:bg-ink/5'
          }`}
        >
          <Type className="h-4 w-4 inline-block mr-1" /> Lines
        </button>
        <button
          onClick={() => setActiveTab('contributors')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'contributors'
              ? 'bg-brass text-ink'
              : 'text-ink/60 hover:text-ink hover:bg-ink/5'
          }`}
        >
          <Users className="h-4 w-4 inline-block mr-1" /> Contributors
        </button>
      </div>

      {saveStatus === 'success' && (
        <div className="bg-emerald/10 border border-emerald/30 text-emerald px-4 py-2 rounded-md text-sm font-medium">
          Saved successfully
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-plum/10 border border-plum/30 text-plum px-4 py-2 rounded-md text-sm font-medium">
          Failed to save. Check console for details.
        </div>
      )}

      {activeTab === 'lines' && (
        <>
          <div className="flex items-center gap-4 p-4 bg-white/60 border border-ink/10 rounded-md">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={showPinyin}
                onChange={e => setShowPinyin(e.target.checked)}
                className="h-4 w-4 rounded border-ink/20 text-brass focus:ring-brass"
              />
              <Type className="h-4 w-4" />
              Show Pinyin
            </label>
            <button
              onClick={() => setShowBulkPaste(true)}
              className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              <ClipboardPaste className="h-4 w-4" />
              Bulk Paste
            </button>
            <button
              onClick={addLine}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Line
            </button>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {lines.map((line, index) => (
          <div
            key={line.id}
            className="bg-white/60 border border-ink/10 rounded-md p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 text-ink/40 mt-1">
                <GripVertical className="h-5 w-5 cursor-grab hover:text-brass" />
                <span className="font-body text-xs text-ink/50">{index + 1}</span>
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block font-body text-xs text-ink/50 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={formatTime(line.startMs)}
                      onChange={e => updateLine(line.id, 'startMs', parseTime(e.target.value))}
                      className="w-full font-mono text-sm rounded border border-ink/20 bg-white px-2 py-1.5 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
                      placeholder="0:00.000"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-ink/50 mb-1">End Time (optional)</label>
                    <input
                      type="text"
                      value={line.endMs ? formatTime(line.endMs) : ''}
                      onChange={e => updateLine(line.id, 'endMs', e.target.value ? parseTime(e.target.value) : null)}
                      className="w-full font-mono text-sm rounded border border-ink/20 bg-white px-2 py-1.5 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
                      placeholder="0:00.000"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-body text-xs text-ink/50 mb-1">Hanzi</label>
                    <textarea
                      value={line.hanzi}
                      onChange={e => updateLine(line.id, 'hanzi', e.target.value)}
                      rows={2}
                      className="w-full font-serif-sc text-base rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass resize-none"
                      placeholder="Chinese text..."
                    />
                  </div>
                </div>

                {showPinyin && line.hanzi && (
                  <div className="font-body text-sm text-ink/50 bg-ink/5 rounded px-3 py-2 font-mono">
                    {line.pinyin || '(generating...)'}
                  </div>
                )}

                <div>
                  <label className="block font-body text-xs text-ink/50 mb-1">English Translation</label>
                  <textarea
                    value={line.translationEn}
                    onChange={e => updateLine(line.id, 'translationEn', e.target.value)}
                    rows={2}
                    className="w-full font-body text-base rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass resize-none"
                    placeholder="English translation..."
                  />
                </div>
              </div>

              <button
                onClick={() => removeLine(line.id)}
                className="text-ink/40 hover:text-plum transition-colors p-1 mt-2"
                aria-label="Delete line"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {lines.length === 0 && (
          <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
            <p className="text-ink/50">No lines yet. Click &ldquo;Add Line&rdquo; to start translating.</p>
          </div>
        )}
      </div>
    </>
  )}

      {showBulkPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="bg-white/95 border border-ink/10 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink/10">
              <h3 className="font-body text-lg font-medium text-ink">Bulk Paste Transcript</h3>
              <button
                onClick={() => { setShowBulkPaste(false); setBulkPasteText(''); setBulkPasteError(null); }}
                className="text-ink/40 hover:text-ink transition-colors p-1"
                aria-label="Close bulk paste"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="font-body text-sm text-ink/60 mb-3">
                Paste lines in format: <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded">timestamp | hanzi | translation</code>
                <br />One line per entry. Example: <code className="font-mono bg-ink/5 px-1.5 py-0.5 rounded">0:05.200 | 你好 | Hello</code>
              </p>
              {bulkPasteError && (
                <div className="bg-plum/10 border border-plum/30 text-plum px-3 py-2 rounded-md text-sm font-medium mb-3">
                  {bulkPasteError}
                </div>
              )}
              <textarea
                value={bulkPasteText}
                onChange={e => setBulkPasteText(e.target.value)}
                rows={20}
                className="w-full font-mono text-sm rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass resize-none"
                placeholder="0:00.000 | 你好 | Hello&#10;0:03.500 | 世界 | World"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-ink/10 bg-ink/5">
              <button
                onClick={() => { setShowBulkPaste(false); setBulkPasteText(''); setBulkPasteError(null); }}
                className="rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPaste}
                className="rounded-md bg-brass text-ink px-4 py-2 text-sm font-medium hover:bg-brass/80 transition-colors"
              >
                Paste & Parse
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contributors' && (
        <div className="space-y-4">
          {isAddingContributor ? (
            <div className="bg-white/60 border border-ink/10 rounded-md p-4 space-y-3">
              <h3 className="font-body text-sm font-medium text-ink">Add Contributor</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={newContributor.personId}
                  onChange={e => setNewContributor({ ...newContributor, personId: e.target.value })}
                  className="col-span-1 rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
                >
                  <option value="">Select person...</option>
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
                <div className="col-span-1 flex items-end">
                  <button
                    onClick={handleAddContributor}
                    className="w-full rounded-md bg-brass text-ink px-3 py-2 text-sm font-medium hover:bg-brass/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              {contributorError && (
                <p className="text-sm text-plum">{contributorError}</p>
              )}
              <button
                onClick={() => setIsAddingContributor(false)}
                className="text-sm text-ink/60 hover:text-ink underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingContributor(true)}
              className="w-full inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5 transition-colors justify-center"
            >
              <UserPlus className="h-4 w-4" />
              Add Contributor
            </button>
          )}

          {contributors.length === 0 && !isAddingContributor && (
            <div className="bg-white/60 border border-ink/10 rounded-md p-8 text-center">
              <p className="text-ink/50">No contributors yet. Click &ldquo;Add Contributor&rdquo; to assign translators, editors, or proofreaders.</p>
            </div>
          )}

          <div className="bg-white/60 border border-ink/10 rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-ink/5 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
                  <th className="px-4 py-3">Person</th>
                  <th className="px-4 py-3 w-40">Role</th>
                  <th className="px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {contributors.map((c) => (
                  <tr key={c.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 font-body text-sm text-ink">
                      {c.person.nameLatin} {c.person.nameHanzi && <span className="text-ink/40 ml-1">({c.person.nameHanzi})</span>}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-ink/60 capitalize">{c.role.toLowerCase()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveContributor(c.id)}
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
        </div>
      )}
    </div>
  );
}