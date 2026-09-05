import { PublicOrderHeader } from "@/components/services/public-order-header";

export const metadata = {
  title: "Book Service | VietVibes Hub",
  description: "Professional photo and video editing services for real estate and media creators.",
};

export default function PublicOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <PublicOrderHeader />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t bg-background/80 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} VietVibes Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
