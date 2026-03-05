import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { fetchActivities, recordAttendance } from "@/service/supabaseData";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Spinner, Sel, B } from "./components/AdminUI";

interface Activity {
    id: string; title: string; description: string; event_date: string;
    status: "active" | "inactive" | "draft"; points_reward: number;
    location: string; max_attendees: number; image_url?: string;
}

export default function ScannerAdmin() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isScanningRef = useRef(false);

    useEffect(() => {
        fetchActivities({ pageSize: 100 })
            .then(({ data }) => setActivities((data || []).filter(a => a.status === 'active')))
            .catch(() => toast.error("فشل تحميل الفعاليات"))
            .finally(() => setLoading(false));
    }, []);

    const playBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.5;

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            setTimeout(() => oscillator.stop(), 150);
        } catch (e) {
            console.log('Audio not supported', e);
        }
    };

    useEffect(() => {
        if (selectedActivity && !scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    videoConstraints: { facingMode: { exact: "environment" } } // IMPORTANT: Fixed to rear camera
                },
                false
            );

            scannerRef.current.render(
                async (decodedText) => {
                    if (isScanningRef.current) return;
                    isScanningRef.current = true;

                    try {
                        scannerRef.current?.pause();


                        // CLEANING LOGIC:
                        // If the scan is a URL, grab the part after the last slash
                        // If it's just an ID, use it as is
                        const cleanId = decodedText.includes('/')
                            ? decodedText.split('/').pop()
                            : decodedText;

                        // Use the extracted 'id' instead of 'decodedText'
                        console.log("Processing ID:", cleanId); // Check your console to see if this is the correct UUID

                        const result = await recordAttendance(cleanId, selectedActivity);

                        if (result.error) {
                            let friendlyMessage = '❌ الكود غير صحيح';

                            if (result.message.includes('Already scanned') || result.message.includes('مسبقاً')) {
                                friendlyMessage = '⚠️ تم المسح مسبقاً لهذا الطالب';
                            } else if (result.message.includes('not found')) {
                                friendlyMessage = '👤 هذا الطالب غير مسجل';
                            }

                            setScanResult({
                                type: 'warning',
                                message: friendlyMessage
                            });
                        } else {
                            playBeep();
                            setScanResult({
                                type: 'success',
                                message: `✅ تم تسجيل الحضور: ${result.student_name}`
                            });
                        }
                    } catch (err) {
                        setScanResult({ type: 'error', message: 'حدث خطأ في الاتصال' });
                    } finally {
                        setTimeout(() => {
                            isScanningRef.current = false;
                            scannerRef.current?.resume();
                            setScanResult(null);
                        }, 3000);
                    }
                },
                (errorMessage) => {
                    // Ignore scanning failures per frame to avoid spam
                }
            );
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error(e));
                scannerRef.current = null;
            }
        };
    }, [selectedActivity]);


    if (loading) return <Spinner />;

    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-xl font-extrabold text-[#111]">الماسح الضوئي</h2>
                <p className="m-0 mt-0.5 text-[#6b7280] text-[13px]">لوحة تسجيل الحضور السريعة عبر رمز الاستجابة السريعة (QR)</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] max-w-[600px] mx-auto">
                <Sel label="اختر الفعالية لبدء المسح *" value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)}>
                    <option value="">-- اختر الفعالية --</option>
                    {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </Sel>

                {selectedActivity ? (
                    <div className="mt-5 relative">
                        <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" style={{ border: `2px solid ${B}` }}></div>
                        <style>{`
                  #qr-reader__scan_region { background: #f8fafc; }
                  #qr-reader__dashboard { padding: 10px; }
                  #qr-reader button { padding: 8px 16px; border-radius: 8px; border: none; background: ${B}; color: white; cursor: pointer; }
               `}</style>

                        {scanResult && (
                            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 rounded-2xl p-6 text-center"
                                style={{ border: `2px solid ${scanResult.type === 'success' ? '#10b981' : scanResult.type === 'warning' ? '#f59e0b' : '#ef4444'}` }}>
                                <div className="text-[48px] mb-3">
                                    {scanResult.type === 'success' ? '✅' : scanResult.type === 'warning' ? '⚠️' : '❌'}
                                </div>
                                <h3 className="m-0 text-lg font-extrabold"
                                    style={{ color: scanResult.type === 'success' ? '#047857' : scanResult.type === 'warning' ? '#b45309' : '#b91c1c' }}>
                                    {scanResult.message}
                                </h3>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[#9ca3af]">
                        <div className="text-5xl mb-3">📹</div>
                        <p>يرجى اختيار الفعالية لفتح الكاميرا</p>
                    </div>
                )}
            </div>
        </div>
    );
}
