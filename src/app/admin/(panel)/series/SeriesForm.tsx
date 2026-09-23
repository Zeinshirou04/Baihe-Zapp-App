"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createSeries, updateSeries } from '@/actions/series';
import { generateSlug } from '@/lib/slug';
import { FormField, Input } from '@/app/admin/_components/FormField';
import { Button } from '@/app/admin/_components/Button';
import { Plus, Loader2, Image } from 'lucide-react';

interface SeriesFormProps {
  initialData: {
    titleHanzi?: string;
    titleLatin?: string;
    titlePinyin?: string;
    slug?: string;
    synopsis?: string;
    posterPath?: string;
    status?: 'ONGOING' | 'COMPLETED' | 'HIATUS';
    year?: number;
  };
  actionUrl: string;
}

export function SeriesForm({ initialData, actionUrl }: SeriesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titleHanzi: initialData.titleHanzi || '',
    titleLatin: initialData.titleLatin || '',
    titlePinyin: initialData.titlePinyin || '',
    slug: initialData.slug || '',
    synopsis: initialData.synopsis || '',
    posterPath: initialData.posterPath || '',
    status: initialData.status || 'ONGOING',
    year: initialData.year?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = actionUrl.includes('/edit');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'titleLatin' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.path) {
        setFormData(prev => ({ ...prev, posterPath: data.path }));
        setPreviewUrl(`/media/${data.path}`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.titleHanzi) newErrors.titleHanzi = 'Required';
    if (!formData.titleLatin) newErrors.titleLatin = 'Required';
    if (!formData.slug) newErrors.slug = 'Required';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = 'Only lowercase, numbers, hyphens';
    if (formData.year && isNaN(Number(formData.year))) newErrors.year = 'Must be a number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      titleHanzi: formData.titleHanzi,
      titleLatin: formData.titleLatin,
      titlePinyin: formData.titlePinyin || null,
      slug: formData.slug,
      synopsis: formData.synopsis || null,
      posterPath: formData.posterPath || null,
      status: formData.status as 'ONGOING' | 'COMPLETED' | 'HIATUS',
      year: formData.year ? Number(formData.year) : null,
    };

    startTransition(() => {
      (isEdit ? updateSeries(actionUrl.split('/')[3], payload) : createSeries(payload))
        .then(() => router.refresh())
        .catch((err) => {
          if (err.message?.includes('Unique constraint')) {
            setErrors({ slug: 'Slug already exists' });
          }
        });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <FormField label="Title (Hanzi)" error={errors.titleHanzi} required>
        <Input
          name="titleHanzi"
          value={formData.titleHanzi}
          onChange={handleChange}
          className="font-serif-sc text-lg"
          placeholder="百合标题"
        />
      </FormField>

      <FormField label="Title (Latin)" error={errors.titleLatin} required helperText="Romanized title">
        <Input
          name="titleLatin"
          value={formData.titleLatin}
          onChange={handleChange}
          placeholder="Baihe Title"
        />
      </FormField>

      <FormField label="Title (Pinyin)" helperText="Optional — with tone marks">
        <Input
          name="titlePinyin"
          value={formData.titlePinyin}
          onChange={handleChange}
          placeholder="Bǎihé Biāotí"
        />
      </FormField>

      <FormField label="Slug" error={errors.slug} required helperText="Auto-generated from Latin title; editable">
        <Input
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="baihe-title"
        />
      </FormField>

      <FormField label="Synopsis" helperText="Optional description shown on series detail page">
        <textarea
          name="synopsis"
          value={formData.synopsis}
          onChange={handleChange}
          rows={4}
          className="w-full rounded border bg-white px-3 py-2 text-ink placeholder-ink/40 focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass transition-colors font-body"
        />
      </FormField>

      <FormField label="Poster" helperText="JPG/PNG/WebP, max 5MB">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
            id="poster-upload"
          />
          <label htmlFor="poster-upload" className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5 cursor-pointer">
            <Plus className="h-4 w-4" />
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Choose File'}
          </label>
          {formData.posterPath && (
            <span className="text-xs text-ink/50">{formData.posterPath}</span>
          )}
        </div>
        {(previewUrl || formData.posterPath) && (
          <div className="mt-2 aspect-[2/3] w-32 bg-ink-raised rounded overflow-hidden">
            <img src={previewUrl || `/media/${formData.posterPath}`} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </FormField>

      <FormField label="Status" required>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-ink focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
        >
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="HIATUS">Hiatus</option>
        </select>
      </FormField>

      <FormField label="Year" error={errors.year} helperText="Optional release year">
        <Input
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          placeholder="2024"
          min="1900"
          max={new Date().getFullYear() + 2}
        />
      </FormField>

      <div className="flex items-center gap-3 pt-4 border-t border-ink/10">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isEdit ? 'Update Series' : 'Create Series'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}