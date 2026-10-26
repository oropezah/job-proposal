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
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Video,
  X,
  Zap,
  Award,
  MessageSquare,
  Maximize2
} from 'lucide-react';

// Tipos de estado: 'idle' = viendo foto; 'intro' = video 1 en la bola con foto de fondo; 'main' = video 2 completo
type PlayerPhase = 'idle' | 'intro' | 'main';

const CHAPTERS = [
  { id: 1, title: '0:00 - Introducción & Contexto', time: 0 },
  { id: 2, title: '0:45 - Arquitectura en n8n', time: 45 },
  { id: 3, title: '1:30 - Demostración en Vivo', time: 90 },
  { id: 4, title: '2:15 - Entrega & Garantía', time: 135 }
];

export default function ProposalSlugPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [slug, setSlug] = useState<string>('upwork-proposal');
  
  // Flujo del reproductor de 3 etapas
  const [phase, setPhase] = useState<PlayerPhase>('idle');
  
  // Estados para Video Main (Video 2)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeChapter, setActiveChapter] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180);
  
  // Estados para Video Intro / Loom (Video 1)
  const [introMuted, setIntroMuted] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  // Modal para Lightbox de captura
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  // Tabs de Plan de Trabajo
  const [activeTab, setActiveTab] = useState<'wins' | 'architecture' | 'timeline' | 'guarantee'>('wins');

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      if (p && p.slug) setSlug(p.slug);
    });
  }, [params]);

  const formattedTitle = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Iniciar flujo: Activa Video 1 (Intro) en la burbuja con la foto de fondo
  const handleStartPitch = () => {
    setPhase('intro');
  };

  // Pasar a Video 2 (Main)
  const handleIntroEnded = () => {
    setPhase('main');
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 100);
  };

  // Salta de intro a main directamente
  const handleSkipIntro = () => {
    handleIntroEnded();
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
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e4ebe4]">
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
        {/* BANNER DEL TRABAJO */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e4ebe4] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e4ebe4]">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#14a800]/10 text-[#108000] text-xs font-semibold uppercase tracking-wider">
                Propuesta Personalizada
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001e00] tracking-tight">
                {formattedTitle}
              </h1>
              <p className="text-[#5e6d55] text-sm sm:text-base max-w-2xl">
                Revisa la grabación y el plan de trabajo interactivo que preparé para resolver tu proyecto.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center gap-1 bg-[#f2f7f2] p-4 rounded-xl border border-[#14a800]/15 min-w-[200px]">
              <span className="text-xs text-[#5e6d55]">Presupuesto Estimado</span>
              <span className="text-xl font-bold text-[#108000]">$500 - $1,500 USD</span>
              <span className="text-[11px] text-[#5e6d55]">Upwork Fixed Price</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <div className="font-semibold text-[#001e00]">5.0 / 5.0</div>
                <div className="text-xs text-[#5e6d55]">Rating Cliente</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14a800]" />
              <div>
                <div className="font-semibold text-[#001e00]">Pago Verificado</div>
                <div className="text-xs text-[#5e6d55]">+$10k Gastados</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5e6d55]" />
              <div>
                <div className="font-semibold text-[#001e00]">United States</div>
                <div className="text-xs text-[#5e6d55]">Cliente de Upwork</div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SECCIÓN IZQUIERDA: ESCENARIO CON SECUENCIA (CAPTURA DE PANTALLA Y VIDEOS 1 Y 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e4ebe4] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#14a800]" />
                  <h2 className="text-lg font-bold text-[#001e00]">
                    {phase === 'main' ? 'Video 2: Grabación de Pantalla (Portafolio)' : 'Job Posting & Video Intro'}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#5e6d55] bg-[#eef2ef] px-2.5 py-1 rounded-md">
                  {phase === 'idle' ? 'Captura de Fondo' : phase === 'intro' ? 'Intro en Vivo' : 'HD 1080p'}
                </span>
              </div>

              {/* CONTENEDOR PRINCIPAL */}
              <div className="relative aspect-video bg-[#001e00] rounded-xl overflow-hidden shadow-lg border border-[#e4ebe4]">
                
                {/* 1. VISTA DE FONDO: FOTO DE LA CAPTURA DEL JOB POSTING (Fase 'idle' e 'intro') */}
                {phase !== 'main' && (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
                      alt="Job Posting Capture"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Botón Overlay para iniciar el Video 1 */}
                    {phase === 'idle' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                        <button
                          onClick={handleStartPitch}
                          className="px-6 py-3 rounded-full bg-[#14a800] hover:bg-[#138b00] active:scale-95 text-white font-bold flex items-center gap-2 shadow-2xl transition-all"
                        >
                          <Play className="w-5 h-5 fill-white" />
                          Ver Propuesta en Video (1 min)
                        </button>
                        <p className="mt-2 text-xs text-white/90 font-medium">
                          Haz clic para iniciar el video intro de Henry
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. REPRODUCTOR COMPLETO: VIDEO 2 (Fase 'main') */}
                {phase === 'main' && (
                  <div className="relative w-full h-full group">
                    <video
                      ref={mainVideoRef}
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onEnded={() => setIsPlaying(false)}
                    >
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    </video>

                    {/* Controls Main */}
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

              {/* LISTA DE CAPÍTULOS */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#5e6d55] uppercase tracking-wider block">
                  Capítulos de la demostración:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            </div>

            {/* TABS DE PLAN DE TRABAJO */}
            <div className="bg-white rounded-2xl p-6 border border-[#e4ebe4] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4ebe4] pb-4">
                <h3 className="text-lg font-bold text-[#001e00]">Plan de Trabajo</h3>
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
                      <Zap className="w-4 h-4" /> Configuración Inicial en n8n
                    </div>
                    <p>Integración limpia de Webhooks para procesar leads en tiempo real.</p>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-2 text-xs sm:text-sm text-[#001e00] animate-fadeIn">
                  <p className="text-[#5e6d55]">Stack sugerido para este trabajo:</p>
                  <ul className="space-y-1">
                    <li>• <strong>n8n Orchestrator</strong> (Workflows automatizados)</li>
                    <li>• <strong>OpenAI / Claude API</strong> (Agente con razonamiento)</li>
                    <li>• <strong>WhatsApp API / CRM</strong> (Canal de atención)</li>
                  </ul>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-2 text-xs sm:text-sm text-[#5e6d55] animate-fadeIn">
                  <p><strong>Día 1:</strong> Conexión de API y diseño del prompt.</p>
                  <p><strong>Día 3:</strong> Pruebas de integración con WhatsApp.</p>
                  <p><strong>Día 5:</strong> Despliegue final y entrega.</p>
                </div>
              )}

              {activeTab === 'guarantee' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" /> 30 Días de Soporte Garantizado
                  </div>
                  <p className="text-amber-800">Cualquier ajuste técnico sin costo extra durante el primer mes.</p>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN DERECHA: SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#e4ebe4] shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#001e00] uppercase tracking-wider block">
                Captura del Trabajo Original
              </span>
              <div 
                onClick={() => setShowScreenshotModal(true)}
                className="relative rounded-xl overflow-hidden border border-[#e4ebe4] cursor-pointer group shadow-inner"
              >
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                  alt="Upwork Job Screenshot"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                  <Maximize2 className="w-4 h-4" /> Ampliar Imagen
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e4ebe4] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#14a800] text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  HO
                </div>
                <div>
                  <h4 className="font-bold text-[#001e00] text-base">Henry Oropeza</h4>
                  <p className="text-xs text-[#5e6d55]">AI & Automation Expert</p>
                </div>
              </div>

              <p className="text-xs text-[#5e6d55] leading-relaxed">
                Fundador de <strong>Synco Agency</strong>. Desarrollo agentes de IA y sistemas automatizados listos para producción.
              </p>

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

      {/* 3. BOLA ABAJO A LA DERECHA (VIDEO 1: INTRO / LOOM) */}
      {/* Solo aparece cuando la fase es 'intro' (Video 1 activo en la burbuja sobre la captura de pantalla) */}
      {phase === 'intro' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-scaleUp">
          <div className="w-72 sm:w-80 bg-[#001e00] text-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#14a800]">
            <div className="p-2.5 bg-white/10 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold">Henry (Video 1: Intro)</span>
              </div>
              <button 
                onClick={handleSkipIntro}
                className="text-white/80 hover:text-white bg-white/20 px-2 py-0.5 rounded text-[10px] transition-colors"
              >
                Saltar Intro →
              </button>
            </div>

            <div className="relative aspect-square bg-black">
              <video
                ref={introVideoRef}
                autoPlay
                playsInline
                muted={introMuted}
                onEnded={handleIntroEnded}
                className="w-full h-full object-cover"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
              </video>

              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                <button
                  onClick={() => setIntroMuted(!introMuted)}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  {introMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop"
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