"use client";
import { Trash2 } from 'lucide-react';
import { deleteSeries } from '@/actions/series';
import { useTransition } from 'react';

interface DeleteButtonProps {
  seriesId: string;
  seriesTitle: string;
}

export function DeleteButton({ seriesId, seriesTitle }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${seriesTitle}"? This will also delete all episodes and translation lines.`)) {
      return;
    }
    startTransition(() => {
      deleteSeries(seriesId);
    });
  };

  return (
    <button
      type="button"
      className="text-center text-sm font-medium text-plum hover:text-plum/80 disabled:opacity-50"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4 mx-auto mb-1" />
      Delete
    </button>
  );
}