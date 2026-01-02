import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChaosContextType {
    latencyMode: boolean;
    serverErrorMode: boolean;
    validationFailMode: boolean;
    stockMismatchMode: boolean;
    toggleLatency: () => void;
    toggleServerError: () => void;
    toggleValidationFail: () => void;
    toggleStockMismatch: () => void;
}

const ChaosContext = createContext<ChaosContextType | undefined>(undefined);

export function ChaosProvider({ children }: { children: ReactNode }) {
    const [latencyMode, setLatencyMode] = useState(false);
    const [serverErrorMode, setServerErrorMode] = useState(false);
    const [validationFailMode, setValidationFailMode] = useState(false);
    const [stockMismatchMode, setStockMismatchMode] = useState(false);

    const toggleLatency = () => setLatencyMode(prev => !prev);
    const toggleServerError = () => setServerErrorMode(prev => !prev);
    const toggleValidationFail = () => setValidationFailMode(prev => !prev);
    const toggleStockMismatch = () => setStockMismatchMode(prev => !prev);

    return (
        <ChaosContext.Provider value={{
            latencyMode,
            serverErrorMode,
            validationFailMode,
            stockMismatchMode,
            toggleLatency,
            toggleServerError,
            toggleValidationFail,
            toggleStockMismatch
        }}>
            {children}
        </ChaosContext.Provider>
    );
}

export function useChaos() {
    const context = useContext(ChaosContext);
    if (context === undefined) {
        throw new Error('useChaos must be used within a ChaosProvider');
    }
    return context;
}
