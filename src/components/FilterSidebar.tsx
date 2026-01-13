
interface FilterSidebarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    sortOption: string;
    onSortChange: (sort: string) => void;
}

const CATEGORIES = [
    { id: '', label: 'All Gear' },
    { id: 'rod', label: 'Rods' },
    { id: 'reel', label: 'Reels' },
    { id: 'lure', label: 'Lures' },
    { id: 'clothing', label: 'Clothing' },
];

export function FilterSidebar({ selectedCategory, onSelectCategory, sortOption, onSortChange }: FilterSidebarProps) {
    return (
        <aside className="w-full md:w-64 space-y-10">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-primary-dark">Garrison Categories</h3>
                <div className="space-y-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`group flex items-center justify-between w-full text-left px-5 py-3.5 rounded-xl transition-all border ${selectedCategory === cat.id
                                ? 'bg-primary/20 border-primary/40 text-white font-black shadow-lg shadow-primary/10'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                }`}
                            data-testid={`filter-category-${cat.id || 'all'}`}
                        >
                            <span className="text-sm tracking-wide uppercase">{cat.label}</span>
                            {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-primary-dark">Sort Directives</h3>
                <div className="relative group">
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none uppercase tracking-widest cursor-pointer group-hover:bg-white/10"
                        data-testid="sort-select"
                    >
                        <option value="featured">Featured Gear</option>
                        <option value="price-asc">Price: Ascending</option>
                        <option value="price-desc">Price: Descending</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </aside>
    );
}
