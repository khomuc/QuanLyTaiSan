import { FormEvent, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Keyboard, X } from 'lucide-react';

interface QRScannerModalProps {
  onScanSuccess: (decodedText: string) => void | Promise<void>;
  onClose: () => void;
}

export function QRScannerModal({ onScanSuccess, onClose }: QRScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false,
    );

    scannerRef.current = scanner;
    scanner.render(
      (decodedText) => {
        if (scannedRef.current) {
          return;
        }

        void submitCode(decodedText);
      },
      () => {
        // Html5Qrcode reports many frame-level misses while scanning.
      },
    );

    return () => {
      if (scannerRef.current) {
        void scannerRef.current.clear().catch(() => undefined);
      }
    };
  }, [onClose, onScanSuccess]);

  async function submitCode(value: string) {
    const code = value.trim();
    if (!code || scannedRef.current) {
      return;
    }

    scannedRef.current = true;
    setLastScannedCode(code);
    await onScanSuccess(code);
    await scannerRef.current?.clear().catch(() => undefined);
    onClose();
  }

  function submitManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitCode(manualCode);
  }

  return (
    <div className="qr-modal-backdrop">
      <div className="qr-modal">
        <div className="qr-modal-header">
          <h2>Quet ma QR/Barcode</h2>
          <button
            className="icon-button"
            onClick={onClose}
            title="Dong"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="qr-modal-body">
          <div id="qr-reader" />
          <p>Dua ma QR hoac ma vach cua tai san vao khung hinh.</p>
          {lastScannedCode && (
            <p className="qr-scan-result">Da doc ma: {lastScannedCode}</p>
          )}

          <form className="qr-manual-form" onSubmit={submitManualCode}>
            <label>
              Nhap ma neu camera chua quet duoc
              <input
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Vi du: QR-TS0001"
                value={manualCode}
              />
            </label>
            <button className="secondary-button" type="submit">
              <Keyboard size={18} />
              Tim theo ma
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
