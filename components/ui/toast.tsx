"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5" />;
            case "error":
                return <XCircle className="h-5 w-5" />;
            case "warning":
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case "success":
                return "bg-green-500 text-white";
            case "error":
                return "bg-red-500 text-white";
            case "warning":
                return "bg-yellow-500 text-white";
            default:
                return "bg-blue-500 text-white";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] ${getStyles(toast.type)}`}
                        >
                            {getIcon(toast.type)}
                            <span className="flex-1 text-sm font-medium">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="hover:opacity-80 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
