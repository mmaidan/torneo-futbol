import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Botón "Instalar": en Android/Chrome dispara el aviso de instalación del navegador;
 * en iPhone (que no lo permite) explica cómo agregarla a la pantalla de inicio.
 * No se muestra si la app ya está instalada.
 */
export const InstallAppButton: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;
  const ios = isIos();
  if (!promptEvent && !ios) return null;

  const handleClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
      return;
    }
    alert(
      'Para instalar la app en tu iPhone: abrí esta página en Safari, tocá el botón Compartir (el cuadrado con la flecha hacia arriba) y elegí "Agregar a pantalla de inicio".'
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-brand-600 hover:bg-brand-500 text-white border-brand-500 transition-colors"
      title="Instalar la app en tu celular"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span className="text-[11px]">Instalar</span>
    </button>
  );
};
