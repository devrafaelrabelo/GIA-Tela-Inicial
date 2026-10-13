import React from 'react';
import { parseVideoUrl } from '../../utils/video';
import { Video, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  url?: string | null;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  className = '',
  autoplay = false,
  muted = false,
  controls = true,
  title = 'Vídeo da publicação'
}) => {
  const parsed = parseVideoUrl(url);

  if (!parsed) return null;

  if (parsed.type === 'embed' && parsed.embedUrl) {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black/90 shadow-md border border-border/50 ${className}`}>
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (parsed.type === 'direct' && parsed.directUrl) {
    return (
      <div className={`relative w-full rounded-xl overflow-hidden bg-black/95 shadow-md border border-border/50 flex items-center justify-center ${className}`}>
        <video
          src={parsed.directUrl}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          playsInline
          preload="metadata"
          className="w-full max-h-[500px] object-contain rounded-xl"
        >
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-brand-wine" />
        <span>Vídeo anexado</span>
      </div>
      <a
        href={parsed.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-brand-wine hover:underline font-semibold"
      >
        <span>Abrir vídeo</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
