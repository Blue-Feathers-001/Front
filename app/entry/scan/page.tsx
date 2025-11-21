'use client';

import { useEffect, useRef, useState } from 'react';

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
  const scannerRef = useRef<any>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize scanner
    const initScanner = async () => {
      try {
        // Wait for library to load
        if (typeof window === 'undefined') {
          return;
        }

        // Import the library dynamically
        const { Html5QrcodeScanner } = await import('html5-qrcode');

        if (!scannerRef.current) {
          console.log('[Scanner] Initializing...');

          // Define handlers inside useEffect to have access to state
          const handleScanSuccess = async (decodedText: string) => {
            try {
              console.log('[Scanner] QR detected:', decodedText);
              // Parse QR code data
              const qrData = JSON.parse(decodedText);

              // Stop scanning temporarily
              setScanning(false);
              if (scannerRef.current) {
                scannerRef.current.clear();
              }

              // Send to backend for validation
              const API_URL = process.env.NEXT_PUBLIC_API_URL;
              console.log('[Scanner] Sending to backend:', API_URL);
              const response = await fetch(`${API_URL}/entries/scan`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(qrData),
              });

              const result = await response.json();
              console.log('[Scanner] Backend response:', result);
              setScanResult(result);

              // Play sound based on result
              if (result.entry === 'allowed') {
                playSuccessSound();
              } else {
                playErrorSound();
              }

              // Auto-reset after 4 seconds
              setTimeout(async () => {
                setScanResult(null);
                setScanning(true);
                // Reinitialize scanner
                const { Html5QrcodeScanner } = await import('html5-qrcode');
                scannerRef.current = new Html5QrcodeScanner(
                  'qr-reader',
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                  },
                  false
                );
                scannerRef.current.render(handleScanSuccess, handleScanError);
              }, 4000);
            } catch (error) {
              console.error('[Scanner] Scan processing error:', error);
              setScanResult({
                success: false,
                entry: 'denied',
                reason: 'Invalid QR code format',
              });

              setTimeout(async () => {
                setScanResult(null);
                setScanning(true);
                // Reinitialize scanner
                const { Html5QrcodeScanner } = await import('html5-qrcode');
                scannerRef.current = new Html5QrcodeScanner(
                  'qr-reader',
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                  },
                  false
                );
                scannerRef.current.render(handleScanSuccess, handleScanError);
              }, 3000);
            }
          };

          const handleScanError = (error: any) => {
            // Ignore continuous scan errors (these are normal when no QR code is in view)
            // console.warn('[Scanner] Scan error:', error);
          };

          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              rememberLastUsedCamera: true, // Auto-start camera on next visit
              showTorchButtonIfSupported: true, // Show flashlight button
            },
            false
          );

          scannerRef.current.render(handleScanSuccess, handleScanError);
          console.log('[Scanner] Initialized successfully');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('[Scanner] Initialization error:', err);
        setError(err.message || 'Failed to initialize scanner');
        setLoading(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          console.error('[Scanner] Cleanup error:', e);
        }
      }
    };
  }, []);

  const playSuccessSound = () => {
    try {
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
    } catch (e) {
      console.error('[Scanner] Sound error:', e);
    }
  };

  const playErrorSound = () => {
    try {
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
    } catch (e) {
      console.error('[Scanner] Sound error:', e);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 flex items-center justify-center relative">
      <div className="w-full max-w-4xl animate-fadeInUp">
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
          <div className="glass-card-solid p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4 animate-float">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Scan Membership Card
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Position the QR code within the frame
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Initializing camera...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-600 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-800 dark:text-red-300 font-semibold">Camera Error</p>
                    <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                    <p className="text-red-600 dark:text-red-500 text-xs mt-2">
                      Please check camera permissions and refresh the page
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* QR Scanner */}
            <div id="qr-reader" className="mx-auto max-w-md rounded-lg overflow-hidden"></div>

            {/* Custom styling for QR scanner */}
            <style jsx global>{`
              #qr-reader {
                border: none !important;
              }
              #qr-reader__dashboard_section {
                background: transparent !important;
              }
              /* Hide camera selection dropdown */
              #qr-reader__camera_selection {
                display: none !important;
              }
              #qr-reader__dashboard_section_csr,
              #qr-reader__dashboard_section_swaplink {
                color: rgb(55 65 81) !important;
                font-weight: 600 !important;
              }
              .dark #qr-reader__dashboard_section_csr,
              .dark #qr-reader__dashboard_section_swaplink {
                color: rgb(243 244 246) !important;
              }
              #qr-reader__dashboard_section_csr button {
                background: white !important;
                color: rgb(17 24 39) !important;
                border: 2px solid rgb(209 213 219) !important;
                padding: 8px 16px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
              }
              .dark #qr-reader__dashboard_section_csr button {
                background: rgb(31 41 55) !important;
                color: rgb(243 244 246) !important;
                border: 2px solid rgb(75 85 99) !important;
              }
              #qr-reader__dashboard_section_csr button:hover {
                background: rgb(243 244 246) !important;
                border-color: rgb(147 51 234) !important;
              }
              .dark #qr-reader__dashboard_section_csr button:hover {
                background: rgb(55 65 81) !important;
                border-color: rgb(168 85 247) !important;
              }
              #qr-reader__scan_region {
                border: 3px solid rgb(147 51 234) !important;
                border-radius: 12px !important;
              }
              #qr-reader__camera_permission_button {
                background: linear-gradient(to right, rgb(147 51 234), rgb(79 70 229)) !important;
                color: white !important;
                border: none !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
              }
              #qr-reader img[alt="Info icon"] {
                filter: brightness(0) invert(1);
              }
            `}</style>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Contactless Entry • Fast & Secure</span>
              </div>
            </div>
          </div>
        ) : (
          // Result Display
          <div
            className={`glass-card-solid rounded-2xl shadow-2xl p-12 text-center transform transition-all duration-500 border-4 ${
              scanResult.entry === 'allowed'
                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-400 dark:border-green-500 animate-pulse'
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-red-400 dark:border-red-500 animate-pulse'
            }`}
          >
            {scanResult.entry === 'allowed' ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl">
                    <svg
                      className="w-20 h-20 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-green-700 dark:text-green-300 mb-4 drop-shadow-lg">
                  WELCOME!
                </h2>
                <p className="text-3xl md:text-4xl text-green-800 dark:text-green-200 font-bold mb-2">
                  {scanResult.user?.name}
                </p>
                <p className="text-xl text-green-700 dark:text-green-300 font-semibold">
                  {scanResult.user?.membershipPlan?.toUpperCase()} Member
                </p>
                <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <p className="text-green-800 dark:text-green-200 text-lg font-medium">✓ {scanResult.reason}</p>
                  {scanResult.user?.membershipExpiry && (
                    <p className="text-green-700 dark:text-green-300 mt-2">
                      Valid until:{' '}
                      <span className="font-semibold">
                        {new Date(scanResult.user.membershipExpiry).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-2xl">
                    <svg
                      className="w-20 h-20 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-red-700 dark:text-red-300 mb-4 drop-shadow-lg">
                  ACCESS DENIED
                </h2>
                {scanResult.user && (
                  <p className="text-2xl md:text-3xl text-red-800 dark:text-red-200 font-bold mb-2">
                    {scanResult.user.name}
                  </p>
                )}
                <p className="text-2xl text-red-700 dark:text-red-300 font-semibold mb-6">
                  ✗ {scanResult.reason}
                </p>
                <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border-2 border-red-300 dark:border-red-500">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-lg">Please contact reception</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">For assistance, please contact gym staff</p>
        </div>
      </div>
    </div>
  );
}
