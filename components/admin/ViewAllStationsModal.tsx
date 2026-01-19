'use client';

import { useEffect, useState } from 'react';

interface Station {
    id: string;
    name: string;
    location?: string;
    description?: string;
    qrCodeUrl?: string;
    createdAt?: string;
    _count?: {
        complaints: number;
    };
}

interface Props {
    onClose: () => void;
}

export default function ViewAllStationsModal({ onClose }: Props) {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/stations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setStations(data);
        } catch (error) {
            console.error('Failed to load stations:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQRCode = (station: Station) => {
        const link = document.createElement('a');
        link.href = station.qrCodeUrl || '';
        link.download = `${station.name}-QRCode.png`;
        link.click();
    };

    const filteredStations = stations.filter((station) =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 shadow-2xl">
                                    <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                                    All Stations Directory
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                                        {stations.length} Total
                                    </span>
                                </h2>
                                <p className="text-sm text-white/90 mt-2 drop-shadow flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Complete list of registered stations with QR codes & analytics
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:rotate-90 active:scale-95 border border-white/30 backdrop-blur-sm shadow-xl"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>
                        <div className="relative flex items-center">
                            <svg className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search stations by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredStations.length === 0 ? (
                        <div className="text-center py-20">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">
                                {searchQuery ? 'No stations found matching your search' : 'No stations registered yet'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredStations.map((station, index) => (
                                <div
                                    key={station.id}
                                    className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl p-6 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                    {/* Station Icon & Name */}
                                    <div className="relative flex items-start gap-4 mb-5">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                {station.name}
                                            </h3>
                                            {station.location && (
                                                <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{station.location}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {station.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {station.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="relative mb-5">
                                        <div className="bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 rounded-xl p-4 border border-blue-100/50 group-hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Complaints</p>
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                            {station._count?.complaints || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 rounded-lg border border-gray-200/50">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-xs font-medium text-gray-700">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Preview */}
                                    {station.qrCodeUrl && (
                                        <div className="relative mb-5">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-xl blur-sm"></div>
                                            <div className="relative bg-white rounded-xl p-4 border-2 border-gray-200/80 group-hover:border-blue-300 transition-colors shadow-sm">
                                                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 flex items-center justify-center">
                                                    <img
                                                        src={station.qrCodeUrl}
                                                        alt={`${station.name} QR Code`}
                                                        className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                                <p className="text-xs text-center text-gray-500 mt-2 font-medium">Scan to access station</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {station.qrCodeUrl && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            <button
                                                onClick={() => downloadQRCode(station)}
                                                className="relative w-full px-4 py-3.5 text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden group/btn"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                                <svg className="w-5 h-5 group-hover/btn:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span className="relative">Download QR Code</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Date */}
                                    {station.createdAt && (
                                        <p className="text-xs text-gray-400 mt-3 text-center">
                                            Added {new Date(station.createdAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200/80 shadow-sm">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-sm text-gray-700">
                                <span className="font-bold text-blue-600">{filteredStations.length}</span>
                                <span className="text-gray-500 mx-1">of</span>
                                <span className="font-bold text-gray-900">{stations.length}</span>
                                <span className="text-gray-600 ml-1">station{stations.length !== 1 ? 's' : ''}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
