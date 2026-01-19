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
            ? `/api/complaints?stationId=${stationId}`
            : `/api/complaints`;

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
                `/api/complaints/${complaintId}`,
                {
                    method: 'PUT',
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

    const deleteComplaint = async (complaintId: string) => {
        if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(
                `/api/complaints/${complaintId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                loadComplaints();
                onStatsUpdate();
            } else {
                alert('Failed to delete complaint');
            }
        } catch (error) {
            console.error('Failed to delete complaint:', error);
            alert('Failed to delete complaint');
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

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedComplaint(complaint)}
                                className="px-4 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                                title="View details"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </button>
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
                            <button
                                onClick={() => deleteComplaint(complaint.id)}
                                className="px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                                title="Delete complaint"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Detail Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedComplaint(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Complaint Details</h2>
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Customer Name</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedComplaint.customerName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedComplaint.customerPhone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Station</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedComplaint.station.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Category</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedComplaint.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Status</label>
                                    <p className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                                        {selectedComplaint.status.toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Submission Method</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedComplaint.submissionMethod === 'voice_call' ? '🎤 Voice' : '📱 QR Code'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600">Description</label>
                                <p className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-800">{selectedComplaint.description}</p>
                            </div>

                            {selectedComplaint.mediaFiles.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-3 block">Media Files ({selectedComplaint.mediaFiles.length})</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedComplaint.mediaFiles.map((media: any) => (
                                            <div key={media.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
                                                {media.fileType.startsWith('image/') ? (
                                                    <img
                                                        src={media.fileUrl}
                                                        alt={media.originalName}
                                                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(media.fileUrl, '_blank')}
                                                    />
                                                ) : media.fileType.startsWith('video/') ? (
                                                    <video
                                                        src={media.fileUrl}
                                                        controls
                                                        className="w-full h-48 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="p-3 bg-gray-50">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{media.originalName}</p>
                                                    <p className="text-xs text-gray-500">{(media.fileSize / 1024).toFixed(1)} KB</p>
                                                    <a
                                                        href={media.fileUrl}
                                                        download={media.originalName}
                                                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-sm text-gray-500">
                                <p>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
