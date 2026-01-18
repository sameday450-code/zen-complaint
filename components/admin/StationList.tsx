'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import EditStationModal from './EditStationModal';

interface Station {
  id: string;
  name: string;
  location?: string;
  description?: string;
  qrCodeUrl?: string;
  _count?: {
    complaints: number;
  };
}

interface Props {
  socket: Socket | null;
  selectedStation: string | null;
  onSelectStation: (stationId: string | null) => void;
  onStatsUpdate: () => void;
}

export default function StationList({ socket, selectedStation, onSelectStation, onStatsUpdate }: Props) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  useEffect(() => {
    loadStations();

    // Listen for real-time station updates
    if (socket) {
      socket.on('station-update', (data) => {
        console.log('Station update received:', data);
        loadStations();
        onStatsUpdate();
      });
    }

    return () => {
      if (socket) {
        socket.off('station-update');
      }
    };
  }, [socket]);

  const loadStations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stations`, {
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

  const handleDelete = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stations/${stationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadStations();
        onStatsUpdate();
        if (selectedStation === stationId) {
          onSelectStation(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete station:', error);
    }
  };

  const downloadQRCode = (station: Station) => {
    const link = document.createElement('a');
    link.href = station.qrCodeUrl || '';
    link.download = `${station.name}-QRCode.png`;
    link.click();
  };

  const handleViewEdit = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStation(station);
  };

  const handleCloseEdit = () => {
    setEditingStation(null);
  };

  const handleEditSuccess = () => {
    loadStations();
    onStatsUpdate();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No stations yet. Add your first station!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {/* Edit Station Modal */}
      {editingStation && (
        <EditStationModal
          station={editingStation}
          onClose={handleCloseEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* All Complaints Option */}
      <button
        onClick={() => onSelectStation(null)}
        className={`w-full text-left p-5 rounded-xl transition-all duration-300 group ${selectedStation === null
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 shadow-lg scale-[1.02]'
          : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${selectedStation === null
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 group-hover:bg-blue-100'
              }`}>
              <svg className={`w-5 h-5 ${selectedStation === null ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-bold ${selectedStation === null ? 'text-blue-900' : 'text-gray-900'
                }`}>All Stations</h3>
              <p className="text-sm text-gray-600">View all complaints</p>
            </div>
          </div>
        </div>
      </button>

      {stations.map((station) => (
        <div
          key={station.id}
          className={`p-5 rounded-xl border-2 transition-all duration-300 group ${selectedStation === station.id
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 shadow-lg scale-[1.02]'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
            }`}
        >
          <button
            onClick={() => onSelectStation(station.id)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 ${selectedStation === station.id
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 group-hover:bg-blue-100'
                  }`}>
                  <svg className={`w-5 h-5 ${selectedStation === station.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${selectedStation === station.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>{station.name}</h3>
                  {station.location && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {station.location}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {station._count?.complaints || 0} complaints
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={(e) => handleViewEdit(station, e)}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-500/30 flex items-center justify-center gap-2"
              title="View/Edit Station"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View/Edit
            </button>
            <button
              onClick={() => downloadQRCode(station)}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
              title="Download QR Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              QR Code
            </button>
            <button
              onClick={() => handleDelete(station.id)}
              className="px-4 py-2.5 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all hover:scale-105 active:scale-95"
              title="Delete Station"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
