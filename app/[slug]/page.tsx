'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  Video,
  X,
  Zap,
  Award,
  ArrowRight,
  Maximize2
} from 'lucide-react';

type PlayerPhase = 'idle' | 'intro' | 'main';

interface PitchData {
  id?: string;
  slug: string;
  client_name?: string | null;
  job_title?: string | null;
  job_summary?: string | null;
  job_skills?: string | string[] | null;
  job_budget?: string | null;
  card_image_url?: string | null;
  intro_video_url?: string | null;
  main_video_url?: string | null;
}

const CHAPTERS = [
  { id: 1, title: '0:00 - Introducción & Contexto', time: 0 },
  { id: 2, title: '0:45 - Arquitectura en n8n', time: 45 },
  { id: 3, title: '1:30 - Demostración en Vivo', time: 90 },
  { id: 4, title: '2:15 - Entrega & Garantía', time: 135 }
];

export default function ProposalSlugPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [slug, setSlug] = useState<string>('demo-rag');
  const [pitch, setPitch] = useState<PitchData | null>(null);

  // Fases del reproductor Loom: 'idle' = captura fija; 'intro' = captura + esfera en esquina; 'main' = video portafolio full
  const [phase, setPhase] = useState<PlayerPhase>('idle');
  
  // Controles Video 2 (Main)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeChapter, setActiveChapter] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  
  // Controles Video 1 (Intro Loom)
  const [introMuted, setIntroMuted] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'wins' | 'architecture' | 'timeline' | 'guarantee'>('wins');

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      const currentSlug = p?.slug || 'demo-rag';
      setSlug(currentSlug);
      fetchPitchData(currentSlug);
    });
  }, [params]);

  const fetchPitchData = async (targetSlug: string) => {
    try {
      // Consulta a nuestra API Route interna para no exponer credenciales
      const res = await fetch(`/api/pitch/${targetSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setPitch(data);
      }
    } catch (err) {
      console.error('Error cargando pitch:', err);
    }
  };

  // Asignación de datos desde Supabase / Fallbacks
  const cardImageUrl = pitch?.card_image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop';
  const introVideoUrl = pitch?.intro_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const mainVideoUrl = pitch?.main_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const jobTitle = pitch?.job_title || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const jobSummary = pitch?.job_summary || 'Te presento la propuesta técnica e implementación en vivo para tu requerimiento.';
  const jobBudget = pitch?.job_budget || '$500 - $1,500 USD';

  let skillsList: string[] = [];
  if (pitch?.job_skills) {
    try {
      skillsList = typeof pitch.job_skills === 'string' ? JSON.parse(pitch.job_skills) : pitch.job_skills;
    } catch {
      skillsList = ['n8n', 'AI Agent', 'API Integration'];
    }
  }

  // Transiciones del reproductor Loom
  const handleStartPitch = () => {
    setPhase('intro');
    setTimeout(() => {
      if (introVideoRef.current) introVideoRef.current.play().catch(() => {});
    }, 100);
  };

  const handleIntroEnded = () => {
    setPhase('main');
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 100);
  };

  const toggleMainPlay = () => {
    if (mainVideoRef.current) {
      if (isPlaying) {
        mainVideoRef.current.pause();
      } else {
        mainVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMainMute = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed: number) => {
    if (mainVideoRef.current) {
      mainVideoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const jumpToTime = (timeInSeconds: number, chapterId: number) => {
    if (phase !== 'main') setPhase('main');
    setActiveChapter(chapterId);
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.currentTime = timeInSeconds;
        setCurrentTime(timeInSeconds);
        mainVideoRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#001e00] font-sans">
      {/* BARRA SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e4ebe4]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#14a800] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-[#001e00] text-base leading-tight block">Synco Agency</span>
              <span className="text-xs text-[#5e6d55] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#14a800] inline-block animate-pulse" />
                Henry Oropeza • Upwork Proposal
              </span>
            </div>
          </div>

          <a
            href="https://www.upwork.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#14a800] hover:bg-[#138b00] active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm"
          >
            Responder en Upwork <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* BANNER ENCABEZADO */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e4ebe4] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4ebe4]">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#14a800]/10 text-[#108000] text-xs font-semibold uppercase tracking-wider">
                Propuesta Loom
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001e00] tracking-tight">
                {jobTitle}
              </h1>
              <p className="text-[#5e6d55] text-sm sm:text-base max-w-2xl leading-relaxed">
                {jobSummary}
              </p>

              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-[#eef2ef] text-[#001e00] text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end justify-center gap-1 bg-[#f2f7f2] p-4 rounded-xl border border-[#14a800]/15 min-w-[200px]">
              <span className="text-xs text-[#5e6d55]">Presupuesto Job</span>
              <span className="text-xl font-bold text-[#108000]">{jobBudget}</span>
              <span className="text-[11px] text-[#5e6d55]">Upwork Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <div className="font-semibold text-[#001e00]">5.0 / 5.0</div>
                <div className="text-xs text-[#5e6d55]">Cliente Verificado</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14a800]" />
              <div>
                <div className="font-semibold text-[#001e00]">Pago Verificado</div>
                <div className="text-xs text-[#5e6d55]">+$10k Invertidos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5e6d55]" />
              <div>
                <div className="font-semibold text-[#001e00]">Estados Unidos</div>
                <div className="text-xs text-[#5e6d55]">Upwork Client</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#14a800]" />
              <div>
                <div className="font-semibold text-[#001e00]">n8n & AI</div>
                <div className="text-xs text-[#5e6d55]">Automatización</div>
              </div>
            </div>
          </div>
        </section>

        {/* REPRODUCTOR LOOM PRINCIPAL (HERO DE LA PÁGINA) */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e4ebe4] shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[#14a800]" />
              <h2 className="text-xl font-extrabold text-[#001e00]">
                {phase === 'main' ? 'Grabación del Portafolio' : 'Video Explicativo de la Propuesta'}
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#108000] bg-[#f2f7f2] px-3 py-1 rounded-full border border-[#14a800]/20">
              {phase === 'idle' ? 'Loom Ready' : phase === 'intro' ? 'Henry Presentando...' : 'Demostración HD'}
            </span>
          </div>

          <div className="relative aspect-video w-full bg-[#001e00] rounded-xl overflow-hidden shadow-xl border border-[#e4ebe4]">
            
            {/* 1. VISTA DE CAPTURA DE SUPABASE (Fases 'idle' e 'intro') */}
            {phase !== 'main' && (
              <div className="relative w-full h-full">
                <img
                  src={cardImageUrl}
                  alt="Upwork Job Screenshot"
                  className="w-full h-full object-cover"
                />

                {phase === 'idle' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                    <button
                      onClick={handleStartPitch}
                      className="px-8 py-4 rounded-full bg-[#14a800] hover:bg-[#138b00] active:scale-95 text-white font-extrabold text-base flex items-center gap-3 shadow-2xl transition-all"
                    >
                      <Play className="w-6 h-6 fill-white" />
                      Reproducir Propuesta Loom (~1 min)
                    </button>
                    <p className="mt-3 text-xs sm:text-sm text-white/90 font-medium drop-shadow-md">
                      Muestra tu captura de pantalla con el video intro de Henry sobre el video
                    </p>
                  </div>
                )}

                {/* 2. ESFERA BUBBLE DENTRO DEL REPRODUCTOR (Fase 'intro') */}
                {phase === 'intro' && (
                  <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 animate-scaleUp">
                    <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-[#14a800] shadow-2xl bg-black">
                      <video
                        ref={introVideoRef}
                        autoPlay
                        playsInline
                        muted={introMuted}
                        onEnded={handleIntroEnded}
                        className="w-full h-full object-cover"
                      >
                        <source src={introVideoUrl} type="video/mp4" />
                      </video>

                      <button
                        onClick={() => setIntroMuted(!introMuted)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      >
                        {introMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={handleIntroEnded}
                      className="px-3 py-1 rounded-full bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20"
                    >
                      Saltar a la demostración →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. REPRODUCTOR COMPLETO VIDEO 2 (Fase 'main') */}
            {phase === 'main' && (
              <div className="relative w-full h-full group">
                <video
                  ref={mainVideoRef}
                  className="w-full h-full object-cover"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={mainVideoUrl} type="video/mp4" />
                </video>

                {!isPlaying && (
                  <div 
                    onClick={toggleMainPlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                  >
                    <button className="w-16 h-16 rounded-full bg-[#14a800] text-white flex items-center justify-center shadow-xl">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                  <div className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer">
                    <div 
                      className="h-full bg-[#14a800] rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button onClick={toggleMainPlay}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button onClick={toggleMainMute}>
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <span className="font-mono">
                        0:{Math.floor(currentTime).toString().padStart(2, '0')} / 3:00
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            playbackSpeed === s ? 'bg-[#14a800] text-white' : 'bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CAPÍTULOS DEL VIDEO */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[#5e6d55] uppercase tracking-wider block">
              Capítulos de la presentación:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {CHAPTERS.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => jumpToTime(chap.time, chap.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all border ${
                    activeChapter === chap.id && phase === 'main'
                      ? 'bg-[#f2f7f2] border-[#14a800] font-semibold text-[#108000]'
                      : 'bg-white border-[#e4ebe4] text-[#001e00] hover:border-[#14a800]/40'
                  }`}
                >
                  <span className="truncate">{chap.title}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#14a800]" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN INFERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#e4ebe4] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ebe4] pb-4">
              <h3 className="text-lg font-bold text-[#001e00]">Plan de Implementación</h3>
              <div className="flex flex-wrap gap-1 bg-[#eef2ef] p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveTab('wins')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'wins' ? 'bg-white text-[#001e00] shadow-sm font-semibold' : 'text-[#5e6d55]'
                  }`}
                >
                  Immediate Wins
                </button>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'architecture' ? 'bg-white text-[#001e00] shadow-sm font-semibold' : 'text-[#5e6d55]'
                  }`}
                >
                  Arquitectura
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'timeline' ? 'bg-white text-[#001e00] shadow-sm font-semibold' : 'text-[#5e6d55]'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('guarantee')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'guarantee' ? 'bg-white text-[#001e00] shadow-sm font-semibold' : 'text-[#5e6d55]'
                  }`}
                >
                  Garantía
                </button>
              </div>
            </div>

            {activeTab === 'wins' && (
              <div className="space-y-3 text-xs sm:text-sm text-[#5e6d55] animate-fadeIn">
                <div className="p-4 rounded-xl bg-[#f2f7f2] border border-[#14a800]/20 space-y-1">
                  <div className="font-semibold text-[#108000] flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Despliegue de Agente IA en n8n
                  </div>
                  <p>Integración limpia de Webhooks para procesar mensajes y reservas en tiempo real.</p>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-2 text-xs sm:text-sm text-[#001e00] animate-fadeIn">
                <p className="text-[#5e6d55]">Tecnologías utilizadas:</p>
                <ul className="space-y-1">
                  <li>• <strong>n8n Self-Hosted:</strong> Orquestación automatizada.</li>
                  <li>• <strong>OpenAI / Claude API:</strong> Agente inteligente.</li>
                  <li>• <strong>WhatsApp API & CRM:</strong> Conexión directa.</li>
                </ul>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-2 text-xs sm:text-sm text-[#5e6d55] animate-fadeIn">
                <p><strong>Día 1:</strong> Conexión de credenciales y Prompting.</p>
                <p><strong>Día 3:</strong> Sincronización de Base de Datos.</p>
                <p><strong>Día 5:</strong> Entrega funcional y pruebas.</p>
              </div>
            )}

            {activeTab === 'guarantee' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-1 animate-fadeIn">
                <div className="font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" /> 30 Días de Garantía
                </div>
                <p className="text-amber-800">Soporte post-entrega sin costo adicional.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#e4ebe4] shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#001e00] uppercase tracking-wider block">
                Captura del Trabajo
              </span>
              <div 
                onClick={() => setShowScreenshotModal(true)}
                className="relative rounded-xl overflow-hidden border border-[#e4ebe4] cursor-pointer group bg-[#eef2ef]"
              >
                <img
                  src={cardImageUrl}
                  alt="Upwork Job Screenshot"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <Maximize2 className="w-4 h-4" /> Ampliar
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e4ebe4] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#14a800] text-white flex items-center justify-center font-extrabold text-lg">
                  HO
                </div>
                <div>
                  <h4 className="font-bold text-[#001e00] text-base">Henry Oropeza</h4>
                  <p className="text-xs text-[#5e6d55]">AI & Automation Specialist</p>
                </div>
              </div>

              <a
                href="https://www.upwork.com"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#14a800] hover:bg-[#138b00] active:scale-95 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Contratar en Upwork <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL LIGHTBOX FOTO */}
      {showScreenshotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4ebe4] pb-2">
              <span className="font-bold text-[#001e00] text-sm">Captura del Upwork Job Posting</span>
              <button onClick={() => setShowScreenshotModal(false)} className="p-1.5 rounded-lg hover:bg-[#eef2ef]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <img
                src={cardImageUrl}
                alt="Full Screenshot"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}