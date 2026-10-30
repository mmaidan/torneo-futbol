import React, { useEffect, useMemo, useState } from 'react';
import { X, LifeBuoy, Download, RotateCcw, Loader2, ShieldCheck } from 'lucide-react';
import { Match, Tournament } from '../types/tournament';
import { syncTournamentToCloud } from '../services/firebase';

// Clave donde la app guarda los torneos en este dispositivo.
const LOCAL_KEY = 'copagol_tournaments_list';
// Copia de seguridad que se hace al abrir esta pantalla, antes de cambiar nada.
const BACKUP_KEY = 'copagol_recovery_backup';

const hasResult = (m?: Match): boolean =>
  !!m && (m.status === 'finished' || m.status === 'live' || (m.events?.length ?? 0) > 0);

function readRaw(): string | null {
  try {
    return localStorage.getItem(LOCAL_KEY);
  } catch {
    return null;
  }
}

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTournament: Tournament;
  isAdmin: boolean;
  onRecover: (tournament: Tournament) => void;
  onRequestLogin: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = (props) =>
  props.isOpen ? <RecoveryContent {...props} /> : null;

const RecoveryContent: React.FC<RecoveryModalProps> = ({
  onClose,
  currentTournament,
  isAdmin,
  onRecover,
  onRequestLogin,
}) => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Antes de tocar nada, se guarda una copia de lo que hay en este dispositivo.
  useEffect(() => {
    try {
      const raw = readRaw();
      if (raw && !localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw);
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const scan = useMemo(() => {
    const raw = readRaw();
    let local: Tournament | undefined;
    try {
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) local = list.find((t: Tournament) => t.id === currentTournament.id);
    } catch {
      /* datos ilegibles */
    }
    const shownById = new Map(currentTournament.matches.map((m) => [m.id, m]));
    const recoverable = (local?.matches ?? []).filter((m) => hasResult(m) && !hasResult(shownById.get(m.id)));
    return {
      raw,
      recoverable,
      localCount: (local?.matches ?? []).filter((m) => hasResult(m)).length,
      shownCount: currentTournament.matches.filter((m) => hasResult(m)).length,
    };
  }, [currentTournament]);

  const teamName = (id: string) => currentTournament.teams.find((t) => t.id === id)?.name ?? id;

  const downloadRaw = () => {
    if (!scan.raw) return;
    const url = URL.createObjectURL(new Blob([scan.raw], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'copia_del_dispositivo.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const recover = async () => {
    if (scan.recoverable.length === 0) return;
    setBusy(true);
    setMessage(null);

    const byId = new Map(scan.recoverable.map((m) => [m.id, m]));
    const known = new Set(currentTournament.matches.map((m) => m.id));
    const matches = [
      ...currentTournament.matches.map((m) => byId.get(m.id) ?? m),
      ...scan.recoverable.filter((m) => !known.has(m.id)),
    ];
    const updated: Tournament = { ...currentTournament, matches, updatedAt: new Date().toISOString() };

    onRecover(updated);
    const ok = await syncTournamentToCloud(updated);
    setMessage(
      ok
        ? { ok: true, text: `Listo: se recuperaron ${scan.recoverable.length} partidos y quedaron guardados en la nube.` }
        : {
            ok: false,
            text: 'Se recuperaron en este dispositivo, pero NO se pudieron guardar en la nube. No cierres ni limpies esta app y avisame.',
          }
    );
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Recuperar resultados</h2>
              <p className="text-xs text-slate-400">Busca lo guardado en este dispositivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ink">{scan.shownCount}</p>
              <p className="text-slate-400">partidos con resultado en la app</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ink">{scan.localCount}</p>
              <p className="text-slate-400">guardados en este dispositivo</p>
            </div>
          </div>

          {scan.recoverable.length > 0 ? (
            <>
              <p className="text-slate-300">
                Encontré <b className="text-ink">{scan.recoverable.length}</b> partidos con resultado que la app no está mostrando:
              </p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {scan.recoverable.map((m) => (
                  <li key={m.id} className="flex justify-between gap-2 bg-slate-800/40 rounded-lg px-3 py-1.5 text-slate-300">
                    <span className="truncate">
                      F{m.round}: {teamName(m.homeTeamId)} vs {teamName(m.awayTeamId)}
                    </span>
                    <span className="font-mono font-bold text-ink flex-shrink-0">
                      {m.homeScore ?? 0} - {m.awayScore ?? 0}
                    </span>
                  </li>
                ))}
              </ul>

              {isAdmin ? (
                <button
                  onClick={recover}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>Recuperar y guardar en la nube</span>
                </button>
              ) : (
                <button
                  onClick={onRequestLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ingresar como administrador para recuperarlos</span>
                </button>
              )}
            </>
          ) : (
            <p className="text-slate-300 bg-slate-800/40 border border-slate-700 rounded-xl p-3">
              {scan.localCount > 0
                ? 'Los resultados guardados en este dispositivo ya están en la app. No hay nada para recuperar acá.'
                : 'En este dispositivo no quedó ningún resultado guardado. Probá abrir esta misma pantalla en el celular o la computadora donde los cargaste.'}
            </p>
          )}

          {message && (
            <p
              className={`rounded-lg px-3 py-2 border ${
                message.ok
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900'
                  : 'text-rose-400 bg-rose-950/40 border-rose-900'
              }`}
            >
              {message.text}
            </p>
          )}

          {scan.raw && (
            <button
              onClick={downloadRaw}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Descargar copia de lo guardado acá (JSON)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
