
export function ProductCardSkeleton() {
    return (
        <div className="bg-surface rounded-xl overflow-hidden shadow-lg animate-pulse h-full">
            <div className="h-48 bg-slate-700 w-full" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-700 rounded w-1/4" />
                <div className="h-8 bg-slate-700 rounded w-full mt-2" />
            </div>
        </div>
    );
}
