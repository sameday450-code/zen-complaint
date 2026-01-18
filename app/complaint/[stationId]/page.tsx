'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Station {
    id: string;
    name: string;
    location?: string;
    description?: string;
}

const COMPLAINT_CATEGORIES = [
    'Service Quality',
    'Cleanliness',
    'Safety Concern',
    'Facility Issue',
    'Staff Behavior',
    'Equipment Malfunction',
    'Accessibility',
    'Other',
];

export default function ComplaintFormPage() {
    const params = useParams();
    const router = useRouter();
    const stationId = params.stationId as string;

    const [station, setStation] = useState<Station | null>(null);
    const [showPrivacyAlert, setShowPrivacyAlert] = useState(true);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        category: '',
        description: '',
    });

    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        loadStation();
    }, [stationId]);

    const loadStation = async () => {
        try {
            const response = await fetch(
                `/api/stations/${stationId}`
            );
            if (!response.ok) {
                throw new Error('Station not found');
            }
            const data = await response.json();
            setStation(data);
        } catch (error) {
            setError('Invalid QR code or station not found');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > 5) {
                alert('Maximum 5 files allowed');
                return;
            }
            setFiles([...files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('stationId', stationId);
            submitData.append('customerName', formData.customerName);
            submitData.append('customerPhone', formData.customerPhone);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);

            files.forEach((file) => {
                submitData.append('files', file);
            });

            const response = await fetch(
                `/api/complaints`,
                {
                    method: 'POST',
                    body: submitData,
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit complaint');
            }

            // Redirect to home with success message
            router.push('/?success=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Privacy Alert Modal
    if (showPrivacyAlert && !privacyAccepted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,163,3,0.3)] max-w-md w-full p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#1ba303] to-[#158a02] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1ba303]/30">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Privacy Notice
                        </h2>
                        <p className="text-sm text-gray-500">Your information is secure with us</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#1ba303]/5 to-[#1ba303]/10 border-l-4 border-[#1ba303] rounded-lg p-5 mb-6 shadow-sm">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Please note that your <strong className="text-[#1ba303]">name</strong> and{' '}
                            <strong className="text-[#1ba303]">contact details</strong> will be collected and used for investigation purposes only.
                            Your information will be handled confidentially and in accordance with our privacy policy.
                        </p>
                    </div>

                    <div className="mb-8">
                        <label className="flex items-start cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={privacyAccepted}
                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                className="mt-1 h-5 w-5 text-[#1ba303] focus:ring-[#1ba303] border-gray-300 rounded transition-all"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                I understand and accept that my personal information will be collected for investigation purposes.
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={() => setShowPrivacyAlert(false)}
                        disabled={!privacyAccepted}
                        className="w-full bg-gradient-to-r from-[#1ba303] to-[#158a02] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#1ba303]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        Continue to Complaint Form
                    </button>
                </div>
            </div>
        );
    }



    // Loading or Error State
    if (!station && !error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error && !station) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)] max-w-md w-full p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Error</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-[#1ba303] to-[#158a02] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#1ba303]/40 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Complaint Form
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(27,163,3,0.2)] p-8 mb-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1ba303]/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Submit Complaint</h1>
                        <div className="flex items-center text-gray-600 bg-gradient-to-br from-[#1ba303]/5 to-[#1ba303]/10 rounded-xl p-4 border border-[#1ba303]/20">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1ba303] to-[#158a02] rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-[#1ba303]/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-gray-900">{station?.name}</p>
                                {station?.location && <p className="text-sm text-gray-500">{station.location}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(27,163,3,0.2)] p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {error && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Full Name <span className="text-[#1ba303]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1ba303] focus:border-transparent transition-all shadow-sm hover:border-[#1ba303]/30"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Phone Number <span className="text-[#1ba303]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    required
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1ba303] focus:border-transparent transition-all shadow-sm hover:border-[#1ba303]/30"
                                    placeholder="+1 (234) 567-8900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Complaint Category <span className="text-[#1ba303]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1ba303] focus:border-transparent transition-all shadow-sm hover:border-[#1ba303]/30 appearance-none bg-white"
                                >
                                    <option value="">Select a category</option>
                                    {COMPLAINT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Description <span className="text-[#1ba303]">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={6}
                                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1ba303] focus:border-transparent transition-all shadow-sm hover:border-[#1ba303]/30 resize-none"
                                placeholder="Please describe your complaint in detail..."
                                minLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Minimum 10 characters required
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Attach Photos/Videos <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1ba303] hover:bg-[#1ba303]/5 transition-all duration-300 cursor-pointer group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#1ba303]/10 group-hover:to-[#1ba303]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                                        <svg className="h-8 w-8 text-gray-400 group-hover:text-[#1ba303] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-base font-medium text-gray-700 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Images or videos (max 5 files, 10MB each)
                                    </p>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200 hover:border-[#1ba303]/30 transition-all group"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                                    <svg className="w-5 h-5 text-[#1ba303]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#1ba303] to-[#158a02] text-white py-5 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-[#1ba303]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Complaint'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
