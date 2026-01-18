'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface Complaint {
    id: string;
    customerName: string;
    customerPhone: string;
    category: string;
    description: string;
    status: string;
    priority: string;
    submissionMethod: string;
    createdAt: string;
    station: {
        name: string;
    };
    mediaFiles: any[];
}

interface Props {
    socket: Socket | null;
    stationId: string | null;
    onStatsUpdate: () => void;
}

export default function ComplaintList({ socket, stationId, onStatsUpdate }: Props) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    useEffect(() => {
        loadComplaints();

        // Listen for real-time complaint updates
        if (socket) {
            socket.on('new-complaint', (data) => {
                console.log('New complaint received:', data);
                loadComplaints();
                onStatsUpdate();
            });

            socket.on('complaint-update', (data) => {
                console.log('Complaint updated:', data);
                loadComplaints();
                onStatsUpdate();
            });
        }

        return () => {
            if (socket) {
                socket.off('new-complaint');
                socket.off('complaint-update');
            }
        };
    }, [socket, stationId]);

    const loadComplaints = async () => {
        const token = localStorage.getItem('token');
        const url = stationId
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/complaints?stationId=${stationId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/complaints`;

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setComplaints(data.complaints || []);
        } catch (error) {
            console.error('Failed to load complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (complaintId: string, status: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/complaints/${complaintId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (response.ok) {
                loadComplaints();
                onStatsUpdate();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'normal':
                return 'bg-blue-100 text-blue-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="spinner"></div>
            </div>
        );
    }

    if (complaints.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <p className="mt-4">No complaints yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {complaints.map((complaint) => (
                <div
                    key={complaint.id}
                    className="group border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-300 hover:scale-[1.01]"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getStatusColor(complaint.status)}`}>
                                    {complaint.status.toUpperCase()}
                                </span>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getPriorityColor(complaint.priority)}`}>
                                    {complaint.priority.toUpperCase()}
                                </span>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-lg text-xs font-semibold shadow-sm">
                                    {complaint.submissionMethod === 'voice_call' ? '🎤 Voice' : '📱 QR Code'}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                                {complaint.category}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {complaint.station.name}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                                {new Date(complaint.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(complaint.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                        <div className="text-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                    {complaint.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{complaint.customerName}</p>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {complaint.customerPhone}
                                    </p>
                                </div>
                            </div>
                            {complaint.mediaFiles.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    {complaint.mediaFiles.length} file(s)
                                </span>
                            )}
                        </div>

                        <select
                            value={complaint.status}
                            onChange={(e) => updateStatus(complaint.id, e.target.value)}
                            className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-400 transition-all cursor-pointer"
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}
