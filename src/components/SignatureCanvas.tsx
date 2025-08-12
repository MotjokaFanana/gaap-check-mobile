import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

interface Props {
  value?: string | null; // data URL
  onChange?: (dataUrl: string | null) => void;
  height?: number;
}

const SignatureCanvas = ({ value, onChange, height = 160 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    padRef.current = new SignaturePad(canvas, { backgroundColor: '#ffffff00', penColor: '#222' });
    (padRef.current as any).onEnd = () => {
      const data = padRef.current!.isEmpty() ? null : padRef.current!.toDataURL();
      onChange?.(data);
    };

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvas.width / dpr, height);
      };
      img.src = value;
    }

    return () => { padRef.current?.off(); };
  }, [height]);

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
      <div className="flex gap-2 p-2 justify-end">
        <button type="button" className="text-sm underline" onClick={() => { padRef.current?.clear(); onChange?.(null); }}>Clear</button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
