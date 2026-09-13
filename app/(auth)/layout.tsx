export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-full min-h-[100dvh] bg-hero">
      {children}
    </div>
  );
}
