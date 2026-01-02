
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
        <aside className="w-full md:w-64 space-y-8">
            <div>
                <h3 className="font-bold text-lg mb-4 text-primary-foreground">Categories</h3>
                <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id
                                    ? 'bg-secondary text-white font-medium'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                            data-testid={`filter-category-${cat.id || 'all'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-4 text-primary-foreground">Sort By</h3>
                <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    data-testid="sort-select"
                >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
        </aside>
    );
}
