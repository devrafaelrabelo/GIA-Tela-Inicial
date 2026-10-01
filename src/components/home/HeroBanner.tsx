import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../../hooks/useWeather';
import { getGreeting, formatFullCurrentDate } from '../../utils/date';
import { Clock, MapPin } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { authStatus, currentUser } = useAuth();
  const weather = useWeather();

  const isLogged = authStatus !== 'unauthenticated' && currentUser;
  const name = isLogged ? currentUser.name.split(' ')[0] : 'Colaborador';
  const unitName = isLogged && currentUser.unit ? `Unidade ${currentUser.unit}` : 'Rede Ambozini';

  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const currentDateFormatted = useMemo(() => formatFullCurrentDate(), []);
  const WeatherIcon = weather.Icon;

  return (
    <section
      id="hero-section"
      aria-label="Boas-vindas"
      className="scroll-mt-24 relative rounded-2xl overflow-hidden shadow-lg p-6 sm:p-10 min-h-[220px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white bg-cover bg-center transition-all duration-300 group hover:shadow-xl"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(20, 15, 17, 0.90) 0%, rgba(30, 20, 24, 0.75) 50%, rgba(35, 25, 30, 0.55) 100%), url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1600&auto=format&fit=crop&q=80')`
      }}
    >
      {/* Subtle shine effect on top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Left Column: Greeting, Quote, Line */}
      <div className="max-w-xl space-y-2 z-10">
        {/* Pills: Date, Clock and Filial */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-stone-300">
          <span className="font-semibold tracking-wide">
            {currentDateFormatted}
          </span>
          <span className="text-stone-500">•</span>
          <span className="inline-flex items-center gap-1 font-mono font-medium text-amber-300/90 bg-white/10 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-xs">
            <Clock size={11} />
            <span>{currentTime}</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 font-medium text-stone-300 bg-white/10 px-2.5 py-0.5 rounded-md text-[11px] backdrop-blur-xs transition-colors hover:bg-white/15 cursor-help"
            title={`${weather.description} em ${weather.location} • Atualizado em tempo real`}
          >
            <WeatherIcon size={12} className={weather.iconColor} />
            <span>{weather.temperature}°C</span>
            <span className="text-stone-400">•</span>
            <MapPin size={10} className="text-rose-400" />
            <span>{weather.location}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-300">{unitName}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white [text-wrap:balance]">
          {greeting}, {name}! 👋
        </h1>

        <p className="text-sm font-medium text-stone-200">
          Que tal fazer hoje um dia ainda melhor?
        </p>

        <blockquote className="text-xs sm:text-sm italic text-stone-300 pt-1 leading-relaxed">
          “Grandes resultados são construídos por pessoas que acreditam em um mesmo propósito.”
        </blockquote>

        {/* Small Red Accent Line */}
        <div className="w-12 h-0.5 bg-[#bd1e3c] mt-2 rounded-full"></div>
      </div>

      {/* Right Column: Signature Calligraphy */}
      <div className="z-10 self-end md:self-center pr-2 text-right">
        <span className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-white/95 select-none drop-shadow-md whitespace-nowrap block">
          Juntos vamos mais longe!
        </span>
        <span className="text-[10px] text-amber-300/80 uppercase tracking-widest font-semibold mt-0.5 block">
          Cultura & Excelência Ambozini
        </span>
      </div>
    </section>
  );
};
