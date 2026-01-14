
export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-surface py-8 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm text-slate-300">
                <p>&copy; {new Date().getFullYear()} The Great Catch. All rights reserved.</p>
                <p className="mt-2" data-testid="footer-note">Built for Chaos Testing.</p>
            </div>
        </footer>
    );
}
