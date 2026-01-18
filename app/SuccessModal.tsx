'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessModal() {
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
