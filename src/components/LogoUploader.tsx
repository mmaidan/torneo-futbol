import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { imageFileToLogoDataUrl } from '../utils/imageUtils';

interface LogoUploaderProps {
  value?: string;
  onChange: (logoUrl: string | undefined) => void;
  label?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  value,
  onChange,
  label = 'Escudo del equipo',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await imageFileToLogoDataUrl(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="block text-slate-400 mb-1.5 font-semibold text-xs">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {value ? (
            <img src={value} alt="Escudo" className="w-full h-full object-contain" />
          ) : (
            <ImagePlus className="w-5 h-5 text-slate-600" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 border border-slate-700"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5 text-brand-400" />}
            <span>{value ? 'Cambiar imagen' : 'Subir imagen'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
};
