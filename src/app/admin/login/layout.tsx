export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      {children}
    </div>
  );
}