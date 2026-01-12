import { TopNav } from "./TopNav";
import { LeftSidebar } from "./LeftSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <TopNav />
            <LeftSidebar />

            {/* Main Content Area */}
            {/* Left padding matches sidebar width (w-64 = 16rem = 256px) on desktop */}
            <main className="lg:pl-64 pt-14 min-h-screen transition-all duration-300">
                <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
