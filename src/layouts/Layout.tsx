import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export function Layout() {
    const { loading } = useAuth();

    // Prevent flicker while restoring auth state from localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-primary font-black animate-pulse tracking-widest uppercase text-sm">
                    Initializing Fleet...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-500">
            {/* Decorative background glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary/20 blur-[120px] pointer-events-none -z-10" />

            <Header />
            <main className="flex-1 w-full container mx-auto px-4 py-12 relative">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
