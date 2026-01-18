'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessModalHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Check if redirected with success parameter
        if (searchParams.get('success') === 'true') {
            setShowSuccessModal(true);
        }
    }, [searchParams]);

    const closeModal = () => {
        setShowSuccessModal(false);
        // Remove success parameter from URL
        router.replace('/');
    };

    if (!showSuccessModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,163,3,0.4)] max-w-md w-full p-10 text-center border border-gray-100 transform animate-scaleIn">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1ba303] to-[#158a02] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#1ba303]/40 animate-bounce">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto bg-[#1ba303] rounded-full blur-2xl opacity-30 animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    Thank You!
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Your complaint has been submitted successfully. Our team will review and respond to your concern promptly.
                </p>
                <div className="bg-gradient-to-br from-[#1ba303]/5 to-[#1ba303]/10 border border-[#1ba303]/20 rounded-xl p-5 mb-8 shadow-sm">
                    <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-[#1ba303]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>You will receive a confirmation soon</span>
                    </p>
                </div>
                <button
                    onClick={closeModal}
                    className="w-full bg-gradient-to-r from-[#1ba303] to-[#158a02] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-[#1ba303]/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default function HomePage() {

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{
                backgroundImage: "url('https://tse4.mm.bing.net/th/id/OIP.vJuwtyPScHqOxQz_gBu0YgHaEL?rs=1&pid=ImgDetMain&o=7&rm=3')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Success Modal */}
            <Suspense fallback={null}>
                <SuccessModalHandler />
            </Suspense>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 backdrop-brightness-90"></div>

            {/* Content wrapper */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 backdrop-blur-md shadow-2xl border-b border-green-400/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20 items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                                    Zen Reporting System
                                </h1>
                            </div>
                            <Link
                                href="/admin/login"
                                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold border border-white/30 hover:border-white/50"
                            >
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                            <p className="text-white font-semibold text-sm">🚀 Advanced AI-Powered Complaint System</p>
                        </div>
                        <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-8 drop-shadow-2xl leading-tight">
                            Your Voice<br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Matters</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg font-light leading-relaxed">
                            Submit complaints effortlessly through QR codes or our cutting-edge AI voice assistant.
                            Experience transparent, prompt resolution of your concerns.
                        </p>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-8 mt-20">
                            {/* QR Code Feature */}
                            <div className="group bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Scan QR Code
                                </h3>
                                <p className="text-white/80 leading-relaxed">
                                    Instantly submit your complaint by scanning the QR code at any station with photo or video evidence.
                                </p>
                            </div>

                            {/* Voice Assistant Feature */}
                            <div className="group bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    AI Voice Assistant
                                </h3>
                                <p className="text-white/80 leading-relaxed">
                                    No smartphone? Call our intelligent AI voice assistant to submit your complaint effortlessly by phone.
                                </p>
                            </div>

                            {/* Real-time Tracking Feature */}
                            <div className="group bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Real-time Updates
                                </h3>
                                <p className="text-white/80 leading-relaxed">
                                    Your complaint reaches administrators instantly with real-time notifications for rapid response.
                                </p>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="mt-32">
                            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                <p className="text-white font-semibold text-sm">📋 Simple Process</p>
                            </div>
                            <h3 className="text-5xl font-bold text-white mb-16 drop-shadow-lg">
                                How It Works
                            </h3>
                            <div className="grid md:grid-cols-4 gap-8">
                                <div className="text-center group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        1
                                    </div>
                                    <h4 className="font-bold text-xl text-white mb-3">Find QR Code</h4>
                                    <p className="text-white/80 leading-relaxed">
                                        Locate the QR code displayed at your station
                                    </p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        2
                                    </div>
                                    <h4 className="font-bold text-xl text-white mb-3">Scan & Submit</h4>
                                    <p className="text-white/80 leading-relaxed">
                                        Scan and complete the complaint form with details
                                    </p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        3
                                    </div>
                                    <h4 className="font-bold text-xl text-white mb-3">Instant Notification</h4>
                                    <p className="text-white/80 leading-relaxed">
                                        Administrators receive your complaint immediately
                                    </p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        4
                                    </div>
                                    <h4 className="font-bold text-xl text-white mb-3">Get Resolution</h4>
                                    <p className="text-white/80 leading-relaxed">
                                        We investigate and resolve your issue promptly
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 mt-32 border-t-4 border-green-500/50 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE4YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bTAgMjBjMC0xLjEuOS0yIDItMnMyIC45IDIgMi0uOSAyLTIgMi0yLS45LTItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-12 mb-16">
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center ring-4 ring-green-500/20 shadow-lg shadow-green-500/30">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Zen Reporting</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                                    Empowering citizens with seamless complaint reporting through innovative AI-powered technology and real-time resolution systems.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-6 text-green-400">Quick Links</h4>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-slate-300 hover:text-green-400 transition-colors flex items-center group"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 group-hover:w-3 transition-all"></span>About Us</a></li>
                                    <li><a href="#" className="text-slate-300 hover:text-green-400 transition-colors flex items-center group"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 group-hover:w-3 transition-all"></span>How It Works</a></li>
                                    <li><a href="#" className="text-slate-300 hover:text-green-400 transition-colors flex items-center group"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 group-hover:w-3 transition-all"></span>Privacy Policy</a></li>
                                    <li><a href="#" className="text-slate-300 hover:text-green-400 transition-colors flex items-center group"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 group-hover:w-3 transition-all"></span>Terms of Service</a></li>
                                    <li><a href="#" className="text-slate-300 hover:text-green-400 transition-colors flex items-center group"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 group-hover:w-3 transition-all"></span>FAQ</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-6 text-green-400">Contact Us</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-3 text-xl">📧</span>
                                        <div>
                                            <p className="text-slate-400 text-sm">Email</p>
                                            <a href="mailto:support@zenreporting.com" className="text-white hover:text-green-400 transition-colors">support@zenreporting.com</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-3 text-xl">📞</span>
                                        <div>
                                            <p className="text-slate-400 text-sm">Phone</p>
                                            <a href="tel:1-800-ZEN-HELP" className="text-white hover:text-green-400 transition-colors">1-800-ZEN-HELP</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-400 mr-3 text-xl">🕒</span>
                                        <div>
                                            <p className="text-slate-400 text-sm">Hours</p>
                                            <p className="text-white">Available 24/7</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-slate-700/50 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-slate-400">
                                    © 2025 <span className="text-green-400 font-semibold">Zen Reporting System</span>. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-slate-400 text-sm">
                                        🔒 Your privacy and security are our top priorities
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
