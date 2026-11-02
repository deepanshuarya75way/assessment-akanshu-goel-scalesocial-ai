
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-display text-lg font-semibold text-ink">
          Social Suite
        </p>

        <div className="rounded-card border border-border bg-white p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
