import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Database, 
  ExternalLink,
  Save,
  Trash2
} from 'lucide-react';
import { 
  FirebaseConfig, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig,
  getFirebaseFirestore 
} from '../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  if (!isOpen) return null;

  const current = getSavedFirebaseConfig();

  const [apiKey, setApiKey] = useState(current?.apiKey || '');
  const [projectId, setProjectId] = useState(current?.projectId || '');
  const [appId, setAppId] = useState(current?.appId || '');
  const [authDomain, setAuthDomain] = useState(current?.authDomain || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setTestStatus('error');
      setStatusMessage('Debes ingresar al menos el API Key y el Project ID.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      appId: appId.trim() || 'copagol-app',
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
    };

    saveFirebaseConfig(config);
    setTestStatus('success');
    setStatusMessage('¡Configuración de Firebase guardada exitosamente! Tus datos ahora se sincronizarán en la nube.');
    setTimeout(() => {
      onConfigSaved();
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas desconectar Firebase y volver a trabajar únicamente en modo LocalStorage?')) {
      clearFirebaseConfig();
      setApiKey('');
      setProjectId('');
      setAppId('');
      setAuthDomain('');
      setTestStatus('idle');
      setStatusMessage('');
      onConfigSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Sincronización Cloud (Firebase Firestore)
              </h2>
              <p className="text-xs text-slate-400">
                Comparte datos en tiempo real entre múltiples dispositivos y árbitros
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

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p className="mb-2">
              💡 <strong>¿Cómo funciona?</strong> Al conectar tu proyecto de Firebase, todos los resultados, planillas y tablas se guardan automáticamente en Cloud Firestore. Varios administradores o delegados pueden ver los cambios al instante desde cualquier celular o PC.
            </p>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
            >
              <span>Abrir Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {testStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Firebase API Key *</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-ink font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Project ID *</label>
              <input
                type="text"
                placeholder="mi-torneo-futbol-app"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-ink font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">App ID (opcional)</label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-ink font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Auth Domain (opcional)</label>
                <input
                  type="text"
                  placeholder="proyecto.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-ink font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {current ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Desconectar Nube</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Conectar Firebase</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
