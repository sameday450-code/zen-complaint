'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import StationList from '@/components/admin/StationList';
import ComplaintList from '@/components/admin/ComplaintList';
import NotificationBell from '@/components/admin/NotificationBell';
import AddStationModal from '@/components/admin/AddStationModal';

interface Admin {
    id: string;
    name: string;
    email: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);
    const [showAddStation, setShowAddStation] = useState(false);
    const [stats, setStats] = useState({
        totalStations: 0,
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
    });

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admin');

        if (!token || !adminData) {
            router.push('/admin/login');
            return;
        }

        setAdmin(JSON.parse(adminData));

        // Initialize WebSocket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
            auth: { token },
        });

        socketInstance.on('connect', () => {
            console.log('✅ Connected to WebSocket');
            socketInstance.emit('join-admin');
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
        });

        setSocket(socketInstance);

        // Load initial stats
        loadStats();

        return () => {
            socketInstance.emit('leave-admin');
            socketInstance.disconnect();
        };
    }, [router]);

    const loadStats = async () => {
        const token = localStorage.getItem('token');
        try {
            const [stationsRes, complaintsRes] = await Promise.all([
                fetch(`/api/stations`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`/api/complaints`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const stations = await stationsRes.json();
            const complaintsData = await complaintsRes.json();

            const complaints = complaintsData.complaints || [];

            setStats({
                totalStations: stations.length,
                totalComplaints: complaints.length,
                pendingComplaints: complaints.filter((c: any) => c.status === 'pending').length,
                resolvedComplaints: complaints.filter((c: any) => c.status === 'resolved').length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        router.push('/admin/login');
    };

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Welcome back, <span className="font-medium text-gray-900">{admin.name}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <NotificationBell socket={socket} />
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95 border border-red-200/50 hover:border-red-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100/50 hover:border-blue-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Total Stations</p>
                                <p className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalStations}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-green-600">●</span> All active locations
                            </p>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100/50 hover:border-purple-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Total Complaints</p>
                                <p className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.totalComplaints}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-purple-600">●</span> Total submissions
                            </p>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-100/50 hover:border-yellow-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                                <p className="text-4xl font-bold bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.pendingComplaints}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-yellow-600 animate-pulse">●</span> Awaiting response
                            </p>
                        </div>
                    </div>

                    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100/50 hover:border-green-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Resolved</p>
                                <p className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.resolvedComplaints}</p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-green-600">●</span> Successfully closed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Station List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                                    Stations
                                </h2>
                                <button
                                    onClick={() => setShowAddStation(true)}
                                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
                                >
                                    + Add Station
                                </button>
                            </div>
                            <StationList
                                socket={socket}
                                selectedStation={selectedStation}
                                onSelectStation={setSelectedStation}
                                onStatsUpdate={loadStats}
                            />
                        </div>
                    </div>

                    {/* Complaint List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
                                {selectedStation ? 'Station Complaints' : 'All Complaints'}
                            </h2>
                            <ComplaintList
                                socket={socket}
                                stationId={selectedStation}
                                onStatsUpdate={loadStats}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Station Modal */}
            {showAddStation && (
                <AddStationModal
                    onClose={() => setShowAddStation(false)}
                    onSuccess={() => {
                        setShowAddStation(false);
                        loadStats();
                    }}
                />
            )}
        </div>
    );
}
