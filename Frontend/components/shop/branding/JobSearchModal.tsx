
// components/JobSearchModal.tsx
import React from 'react';
import { X, Calendar } from 'lucide-react';

interface JobSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchDateFrom: string;
    searchDateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
}


export const JobSearchModal: React.FC<JobSearchModalProps> = ({
    isOpen,
    onClose,
    searchDateFrom,
    searchDateTo,
    onDateFromChange,
    onDateToChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Use a logo from a previous job</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Job Card Number:
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="Enter job card number"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date:
                                </label>
                                <input
                                    type="date"
                                    value={searchDateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date:
                                </label>
                                <input
                                    type="date"
                                    value={searchDateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <button className="w-full bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
