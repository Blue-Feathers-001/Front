'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScanResult {
  success: boolean;
  entry: 'allowed' | 'denied';
  reason: string;
  user?: {
    name: string;
    membershipPlan: string;
    membershipStatus: string;
    membershipExpiry: Date | null;
    avatar?: string;
  };
}

export default function EntryScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Initialize scanner
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(handleScanSuccess, handleScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);

      // Stop scanning temporarily
      setScanning(false);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      // Send to backend for validation
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/entry/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrData),
      });

      const result = await response.json();
      setScanResult(result);

      // Play sound based on result
      if (result.entry === 'allowed') {
        playSuccessSound();
      } else {
        playErrorSound();
      }

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        setScanning(true);
        if (scannerRef.current) {
          scannerRef.current.render(handleScanSuccess, handleScanError);
        }
      }, 4000);
    } catch (error) {
      console.error('Scan processing error:', error);
      setScanResult({
        success: false,
        entry: 'denied',
        reason: 'Invalid QR code format',
      });

      setTimeout(() => {
        setScanResult(null);
        setScanning(true);
        if (scannerRef.current) {
          scannerRef.current.render(handleScanSuccess, handleScanError);
        }
      }, 3000);
    }
  };

  const handleScanError = (error: any) => {
    // Ignore continuous scan errors
    // console.warn('Scan error:', error);
  };

  const playSuccessSound = () => {
    // Create audio context for beep
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            BLUE FEATHERS GYM
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Member Entry System
          </p>
        </div>

        {/* Scanner or Result */}
        {!scanResult ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Scan Membership Card
              </h2>
              <p className="text-gray-600">
                Position the QR code within the frame
              </p>
            </div>

            {/* QR Scanner */}
            <div id="qr-reader" className="mx-auto max-w-md"></div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>🔒 Contactless Entry • Fast & Secure</p>
            </div>
          </div>
        ) : (
          // Result Display
          <div
            className={`rounded-2xl shadow-2xl p-12 text-center transform transition-all duration-500 ${
              scanResult.entry === 'allowed'
                ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse'
                : 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse'
            }`}
          >
            {scanResult.entry === 'allowed' ? (
              <>
                <div className="mb-6">
                  <svg
                    className="w-32 h-32 mx-auto text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  WELCOME!
                </h2>
                <p className="text-3xl text-white font-semibold mb-2">
                  {scanResult.user?.name}
                </p>
                <p className="text-xl text-white/90">
                  {scanResult.user?.membershipPlan?.toUpperCase()} Member
                </p>
                <div className="mt-8 text-white/80 text-lg">
                  <p>✓ {scanResult.reason}</p>
                  {scanResult.user?.membershipExpiry && (
                    <p className="mt-2">
                      Valid until:{' '}
                      {new Date(scanResult.user.membershipExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <svg
                    className="w-32 h-32 mx-auto text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  ACCESS DENIED
                </h2>
                {scanResult.user && (
                  <p className="text-2xl text-white font-semibold mb-2">
                    {scanResult.user.name}
                  </p>
                )}
                <p className="text-2xl text-white/90 font-medium">
                  ✗ {scanResult.reason}
                </p>
                <div className="mt-8 bg-white/20 rounded-lg p-4 text-white">
                  <p className="font-semibold">Please contact reception</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>For assistance, please contact gym staff</p>
        </div>
      </div>
    </div>
  );
}
