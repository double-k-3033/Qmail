import type { QRCodeStyleOptions } from "@/Qubic/lib/wallet-connect/qr-code";

export const QRCodePresets: Record<string, QRCodeStyleOptions> = {
  walletConnect: {
    size: 256,
    margin: 4,
    errorCorrectionLevel: "M",
    rounded: false,
    border: false,
    shadow: false,
    backgroundColor: "transparent",
    backgroundPattern: "none",
  },
  default: {
    size: 256,
    margin: 4,
    errorCorrectionLevel: "M",
  },
};

export function downloadQRCode(dataUrl: string, filename: string = "qr-code.png"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
