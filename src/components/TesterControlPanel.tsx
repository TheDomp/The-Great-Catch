import { useState } from 'react';
import { useChaos } from '../context/ChaosContext';
import { Zap, AlertTriangle, Clock, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

export function TesterControlPanel() {
    const {
        latencyMode, toggleLatency,
        serverErrorMode, toggleServerError,
        validationFailMode, toggleValidationFail,
        stockMismatchMode, toggleStockMismatch
    } = useChaos();

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 ${isExpanded ? 'w-64' : 'w-12'}`}>
            <div className="bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors"
                    data-testid="chaos-toggle-btn"
                >
                    <div className="flex items-center gap-2">
                        <Zap className={`w-5 h-5 ${isExpanded ? 'text-secondary' : 'text-slate-400'}`} />
                        {isExpanded && <span className="font-bold text-sm">Chaos Engine</span>}
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>

                {isExpanded && (
                    <div className="p-3 space-y-3 bg-background/95 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Latency (2s)</span>
                            </div>
                            <Switch checked={latencyMode} onChange={toggleLatency} testId="toggle-latency" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span>500 Error</span>
                            </div>
                            <Switch checked={serverErrorMode} onChange={toggleServerError} testId="toggle-500" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                                <XCircle className="w-3 h-3 text-yellow-400" />
                                <span>Validation Fail</span>
                            </div>
                            <Switch checked={validationFailMode} onChange={toggleValidationFail} testId="toggle-validation" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                                <Zap className="w-3 h-3 text-orange-400" />
                                <span>Stock Mismatch</span>
                            </div>
                            <Switch checked={stockMismatchMode} onChange={toggleStockMismatch} testId="toggle-stock" />
                        </div>

                        <div className="pt-2 border-t border-white/10 text-[10px] text-muted text-center">
                            Tester's Control Panel
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Switch({ checked, onChange, testId }: { checked: boolean; onChange: () => void; testId: string }) {
    return (
        <button
            onClick={onChange}
            data-testid={testId}
            className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-secondary' : 'bg-slate-600'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    );
}
