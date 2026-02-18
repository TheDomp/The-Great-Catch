import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askGLM } from '../services/aiService';

interface CatchWhispererProps {
    product: {
        name: string;
        category: string;
        description: string;
    };
}

export const CatchWhisperer: React.FC<CatchWhispererProps> = ({ product }) => {
    const { user } = useAuth();
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getAdvice = async () => {
        if (!user) return;
        setLoading(true);

        // Create a personalized prompt
        // We cast user as any because our local User type might not have all Firestore fields defined yet
        const userProfile = user as any;
        const prompt = `
      Användare: ${userProfile.name}
      Intressen: ${userProfile.bio || 'Sportfiske'}
      Titel: ${userProfile.title || 'Fiskeentusiast'}
      
      Produkt: ${product.name} (${product.category})
      Beskrivning: ${product.description}
      
      Ge ett personligt köpråd baserat på användarens intressen och denna produkt.
    `;

        const result = await askGLM(prompt);
        setAdvice(result);
        setLoading(false);
    };

    useEffect(() => {
        if (user && !advice && !loading) {
            getAdvice();
        }
    }, [user, product.name]);

    if (!user) return null;

    return (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#1a1c2e] to-[#0f111a] border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.15)] relative overflow-hidden group">
            {/* Animated glow background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 blur-[60px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/40">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <h4 className="text-sky-300 font-bold text-sm uppercase tracking-widest">The Catch Whisperer</h4>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-sky-400/60 uppercase tracking-tighter">AI Powered Expert Analysis</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2 py-2">
                        <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-white/5 rounded-full w-[90%] animate-pulse" />
                        <div className="h-4 bg-white/5 rounded-full w-[70%] animate-pulse" />
                    </div>
                ) : (
                    <p className="text-white/90 italic leading-relaxed text-sm">
                        "{advice || 'Väntar på inspiration...'}"
                    </p>
                )}

                <button
                    onClick={getAdvice}
                    disabled={loading}
                    className="mt-4 text-[10px] text-sky-400/50 hover:text-sky-300 transition-colors uppercase tracking-widest flex items-center gap-1 group/btn"
                >
                    <span>Uppdatera råd</span>
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
};
