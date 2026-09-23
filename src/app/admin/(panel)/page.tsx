import { prisma } from "@/db/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StatCard } from "@/app/admin/_components/StatCard";
import Link from "next/link";
import { BookOpen, List, FileText, Plus, FolderOpen } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const [seriesCount, episodeCount, lineCount] = await Promise.all([
    prisma.series.count(),
    prisma.episode.count(),
    prisma.line.count(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <header className="flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-sc text-3xl text-ink">百合</h1>
          <p className="text-ink/50 mt-1">Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink/50">Overview</span>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Series"
          value={seriesCount}
          icon={<BookOpen className="h-6 w-6" />}
          action={{
            label: "Manage Series",
            href: "/admin/series",
            ariaLabel: "View all series"
          }}
        />
        <StatCard
          label="Episodes"
          value={episodeCount}
          icon={<List className="h-6 w-6" />}
          action={{
            label: "Manage Episodes",
            href: "/admin/episodes",
            ariaLabel: "View all episodes"
          }}
        />
        <StatCard
          label="Translation Lines"
          value={lineCount}
          icon={<FileText className="h-6 w-6" />}
          action={{
            label: "View Episodes",
            href: "/admin/episodes",
            ariaLabel: "View episodes with translation lines"
          }}
        />
      </div>

      <section className="bg-white/60 border border-ink/10 rounded-md p-6">
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/series/new"
            className="inline-flex items-center gap-2 rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Series
          </Link>
          <Link
            href="/admin/series"
            className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Manage Series
          </Link>
        </div>
      </section>
    </div>
  );
}
