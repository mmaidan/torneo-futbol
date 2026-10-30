import React, { useState } from 'react';
import { Tournament, Match } from '../types/tournament';
import { 
  X, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Calendar, 
  Trophy 
} from 'lucide-react';
import { generateWhatsAppStandingsText, generateWhatsAppRoundFixtureText } from '../utils/exportUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  tournament,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'referee_sheet'>('whatsapp');
  const [copied, setCopied] = useState(false);
  
  const allRounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  const [selectedRound, setSelectedRound] = useState<number>(allRounds[0] || 1);
  const [shareType, setShareType] = useState<'standings' | 'fixture'>('standings');

  const generatedText = shareType === 'standings' 
    ? generateWhatsAppStandingsText(tournament)
    : generateWhatsAppRoundFixtureText(tournament, selectedRound);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppDirect = () => {
    const encoded = encodeURIComponent(generatedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const selectedMatches = tournament.matches.filter((m) => m.round === selectedRound);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Compartir & Exportar Torneo
              </h2>
              <p className="text-xs text-slate-400">
                Difusión por WhatsApp o Planilla Oficial Imprimible para Árbitros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-3 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 font-bold transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-ink'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Mensajes WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('referee_sheet')}
            className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 font-bold transition-colors ${
              activeTab === 'referee_sheet'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-ink'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Planilla de Cancha / Árbitro (Imprimir)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Tab 1: WhatsApp Text */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Contenido:</span>
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                    <button
                      onClick={() => setShareType('standings')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors ${
                        shareType === 'standings' ? 'bg-brand-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      🏆 Tabla de Posiciones
                    </button>
                    <button
                      onClick={() => setShareType('fixture')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors ${
                        shareType === 'fixture' ? 'bg-brand-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      📅 Programación / Fixture
                    </button>
                  </div>
                </div>

                {shareType === 'fixture' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Fecha:</span>
                    <select
                      value={selectedRound}
                      onChange={(e) => setSelectedRound(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-ink font-mono"
                    >
                      {allRounds.map((r) => (
                        <option key={r} value={r}>Fecha {r}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Text Preview Area */}
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedText}
                  rows={10}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-4 leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar al Portapapeles'}</span>
                </button>
                <button
                  type="button"
                  onClick={openWhatsAppDirect}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Referee Match Sheet (Planilla de Partido) */}
          {activeTab === 'referee_sheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">
                  Planilla oficial en blanco lista para imprimir y entregar a los veedores o árbitros.
                </span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Planilla</span>
                </button>
              </div>

              {/* Printable sheet preview container */}
              <div className="paper bg-white text-slate-900 p-6 rounded-xl shadow-lg border border-slate-300 font-sans text-xs space-y-4">
                
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wider">{tournament.name}</h2>
                    <p className="text-xs text-slate-600">
                      PLANILLA OFICIAL DE PARTIDO • Fútbol {tournament.modality.replace('f', '')} • {tournament.category}
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono font-bold">
                    FECHA: _________ | CANCHA: _________
                  </div>
                </div>

                {/* Match score header */}
                <div className="grid grid-cols-3 items-center text-center py-2 border-b border-slate-300">
                  <div className="text-sm font-bold uppercase">EQUIPO LOCAL: _________________</div>
                  <div className="text-xl font-black font-mono border-2 border-slate-400 py-1 px-4 rounded inline-block mx-auto">
                    [ &nbsp; &nbsp; ] &nbsp; - &nbsp; [ &nbsp; &nbsp; ]
                  </div>
                  <div className="text-sm font-bold uppercase">EQUIPO VISITANTE: _________________</div>
                </div>

                {/* Lineup tables */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Local Team */}
                  <div>
                    <div className="font-bold uppercase text-[11px] bg-slate-100 p-1 mb-1 border border-slate-300">
                      JUGADORES LOCALES
                    </div>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-300 p-1 w-8">#</th>
                          <th className="border border-slate-300 p-1">Apellido y Nombre</th>
                          <th className="border border-slate-300 p-1 w-8">Gol</th>
                          <th className="border border-slate-300 p-1 w-8">Tarj</th>
                          <th className="border border-slate-300 p-1 w-12">Firma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <tr key={i} className="h-5">
                            <td className="border border-slate-300 text-center font-mono">{i + 1}</td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Visitor Team */}
                  <div>
                    <div className="font-bold uppercase text-[11px] bg-slate-100 p-1 mb-1 border border-slate-300">
                      JUGADORES VISITANTES
                    </div>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-300 p-1 w-8">#</th>
                          <th className="border border-slate-300 p-1">Apellido y Nombre</th>
                          <th className="border border-slate-300 p-1 w-8">Gol</th>
                          <th className="border border-slate-300 p-1 w-8">Tarj</th>
                          <th className="border border-slate-300 p-1 w-12">Firma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <tr key={i} className="h-5">
                            <td className="border border-slate-300 text-center font-mono">{i + 1}</td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                            <td className="border border-slate-300"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-4 text-center text-[10px] text-slate-700">
                  <div className="border-t border-slate-400 pt-1">
                    Firma Capitán Local
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    Firma del Árbitro
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    Firma Capitán Visitante
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
