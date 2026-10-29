import React from 'react';

interface TeamBadgeProps {
  logoUrl?: string;
  color?: string;
  name?: string;
  /** Lado del escudo en píxeles cuando el equipo tiene imagen. */
  size?: number;
  /** Clases de la marca de color que se muestra si el equipo no subió imagen. */
  fallbackClassName: string;
}

/**
 * Muestra el escudo del equipo si lo subió; si no, la marca de color de siempre.
 */
export const TeamBadge: React.FC<TeamBadgeProps> = ({
  logoUrl,
  color,
  name,
  size = 24,
  fallbackClassName,
}) => {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name ? `Escudo de ${name}` : ''}
        loading="lazy"
        className="rounded-md object-contain flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return <div className={fallbackClassName} style={{ backgroundColor: color }} />;
};
