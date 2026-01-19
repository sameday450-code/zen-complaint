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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">All Stations</h2>
                            <p className="text-sm text-blue-100 mt-1">View all registered stations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/30"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search stations by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                        />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStations.map((station) => (
                                <div
                                    key={station.id}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                                >
                                    {/* Station Icon & Name */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {station.name}
                                            </h3>
                                            {station.location && (
                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {station.location}
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
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                                        <div className="flex-1 bg-blue-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div>
                                                    <p className="text-xs text-gray-600">Complaints</p>
                                                    <p className="text-lg font-bold text-blue-600">{station._count?.complaints || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Preview */}
                                    {station.qrCodeUrl && (
                                        <div className="mb-4">
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <img
                                                    src={station.qrCodeUrl}
                                                    alt={`${station.name} QR Code`}
                                                    className="w-full h-32 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {station.qrCodeUrl && (
                                        <button
                                            onClick={() => downloadQRCode(station)}
                                            className="w-full px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download QR Code
                                        </button>
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
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredStations.length}</span> of{' '}
                        <span className="font-semibold text-gray-900">{stations.length}</span> station{stations.length !== 1 ? 's' : ''}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all hover:scale-105 active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
