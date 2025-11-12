import React, { useState, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ImageDropzone from './components/ImageDropzone';
import ComparisonSlider from './components/ComparisonSlider';
import { restoreImage } from './services/gemini';
import { RestorationOptions } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<RestorationOptions>({
    colorize: true,
    fixDamage: true,
    enhanceDetails: true,
  });

  const handleImageSelected = useCallback((base64: string) => {
    setOriginalImage(base64);
    setRestoredImage(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setRestoredImage(null);
    setError(null);
  }, []);

  const handleRestore = async () => {
    if (!originalImage || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await restoreImage(originalImage, options);
      setRestoredImage(result);
    } catch (err: any) {
      setError(err.message || "Nepavyko atkurti nuotraukos. Bandykite dar kartą.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (key: keyof RestorationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    if (!restoredImage) return;

    try {
      // Convert base64 to blob
      const byteString = atob(restoredImage.split(',')[1]);
      const mimeString = restoredImage.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });

      // For mobile devices, try to use the File API
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Create a File object for sharing
        const file = new File([blob], 'restauruota-nuotrauka.png', { type: mimeString });

        navigator.share({
          files: [file],
          title: 'Restauruota nuotrauka',
        }).catch((error) => {
          // If share fails, fallback to direct download
          console.log('Share failed, using fallback download', error);
          downloadBlob(blob);
        });
      } else {
        // Desktop or browsers without share API
        downloadBlob(blob);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Nepavyko atsisiųsti nuotraukos. Bandykite dar kartą.');
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'restauruota-nuotrauka.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Analytics />
      <div className="flex flex-col h-screen bg-vintage-cream text-vintage-brown overflow-y-auto no-scrollbar">
        {/* Vintage Header */}
      <header className="sticky top-0 z-50 bg-vintage-brown text-vintage-cream border-b-4 border-vintage-gold shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Vintage Camera Icon */}
              <div className="w-12 h-12 bg-vintage-gold rounded-sm flex items-center justify-center shadow-md transform -rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-vintage-brown">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  RetroAtgaiva
                </h1>
                <p className="text-xs text-vintage-gold uppercase tracking-widest">Nuotraukų Restauravimas</p>
              </div>
            </div>
            {originalImage && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-vintage-gold text-vintage-brown font-semibold rounded shadow-md hover:bg-vintage-amber transition-all transform hover:scale-105"
                disabled={isProcessing}
              >
                ← Pradėti iš naujo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 pb-20 w-full max-w-7xl mx-auto">

        {/* Error Banner */}
        {error && (
          <div className="w-full max-w-2xl bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {!originalImage ? (
          <div className="flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-500">
            {/* Hero Section - Enhanced with Picsart-inspired spacing */}
            <div className="w-full max-w-6xl mx-auto py-16 md:py-24 px-6 md:px-12">
              <div className="text-center mb-16">
                <div className="mb-10 flex justify-center">
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-vintage-sepia rounded-full flex items-center justify-center shadow-2xl border-8 border-vintage-gold transform rotate-12 animate-flicker">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-14 h-14 md:w-16 md:h-16 text-vintage-cream">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-vintage-brown mb-8 leading-tight px-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Prikelkite senus prisiminimus
                </h2>
                <p className="text-lg md:text-xl text-vintage-sepia leading-relaxed max-w-3xl mx-auto mb-12 px-6">
                  <span className="inline-block border-l-4 border-vintage-gold pl-4 italic">
                    "Kiekviena nuotrauka - tai langas į praeitį. Atveriam jį plačiai su modernių technologijų pagalba ir suteikiam jūsų prisiminimams naują gyvenimą."
                  </span>
                </p>
              </div>

              {/* Upload Area - Larger and more prominent */}
              <div className="max-w-4xl mx-auto mb-16">
                <ImageDropzone onImageSelected={handleImageSelected} />
              </div>

              {/* Vintage Feature Cards - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 max-w-5xl mx-auto">
                <div className="bg-vintage-paper border-4 border-vintage-sepia rounded-lg p-8 shadow-xl transform hover:-rotate-1 transition-all hover:shadow-2xl">
                  <div className="text-5xl mb-4 text-center">📷</div>
                  <h3 className="text-xl font-bold text-vintage-brown mb-3 text-center" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Senų Nuotraukų Restauravimas
                  </h3>
                  <p className="text-sm text-vintage-sepia text-center leading-relaxed">
                    Atkuriame pažeistas, sudėvėtas nuotraukas su AI pagalba
                  </p>
                </div>

                <div className="bg-vintage-paper border-4 border-vintage-sepia rounded-lg p-8 shadow-xl transform hover:rotate-1 transition-all hover:shadow-2xl">
                  <div className="text-5xl mb-4 text-center">🎨</div>
                  <h3 className="text-xl font-bold text-vintage-brown mb-3 text-center" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Automatinis Spalvinimas
                  </h3>
                  <p className="text-sm text-vintage-sepia text-center leading-relaxed">
                    Nuspalviname juodai-baltų nuotraukų natūraliai ir tikroviš</p>
                </div>

                <div className="bg-vintage-paper border-4 border-vintage-sepia rounded-lg p-8 shadow-xl transform hover:-rotate-1 transition-all hover:shadow-2xl">
                  <div className="text-5xl mb-4 text-center">✨</div>
                  <h3 className="text-xl font-bold text-vintage-brown mb-3 text-center" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Įbrėžimų Šalinimas
                  </h3>
                  <p className="text-sm text-vintage-sepia text-center leading-relaxed">
                    Pašaliname įbrėžimus ir pažeidimus, grąžindami originalų grožį
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 md:px-12 py-12">

            {/* Restoration Controls - Enhanced spacing */}
            {!restoredImage && !isProcessing && (
                <div className="w-full max-w-5xl mb-12 p-10 md:p-12 bg-vintage-paper rounded-lg border-4 border-vintage-sepia shadow-2xl">
                    <div className="mb-10 text-center">
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-vintage-brown mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                        Restauravimo Nustatymai
                      </h3>
                      <div className="h-1 w-40 bg-vintage-gold mx-auto"></div>
                      <p className="text-vintage-sepia mt-4 text-sm md:text-base">Pasirinkite norimas funkcijas prieš pradėdami restauravimą</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full">
                             <label className="flex flex-col items-center space-y-4 cursor-pointer group p-6 bg-vintage-cream rounded-lg border-3 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg flex-1 min-w-[160px] md:min-w-[180px]">
                                <div className={`w-12 h-12 border-3 rounded flex items-center justify-center transition-all ${options.fixDamage ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.fixDamage && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.fixDamage} onChange={() => toggleOption('fixDamage')} />
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-vintage-brown block mb-2">🔧</span>
                                  <span className="text-sm md:text-base font-semibold text-vintage-brown">Taisyti pažeidimus</span>
                                </div>
                            </label>

                             <label className="flex flex-col items-center space-y-4 cursor-pointer group p-6 bg-vintage-cream rounded-lg border-3 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg flex-1 min-w-[160px] md:min-w-[180px]">
                                <div className={`w-12 h-12 border-3 rounded flex items-center justify-center transition-all ${options.enhanceDetails ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.enhanceDetails && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.enhanceDetails} onChange={() => toggleOption('enhanceDetails')} />
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-vintage-brown block mb-2">🔍</span>
                                  <span className="text-sm md:text-base font-semibold text-vintage-brown">Paryškinti detales</span>
                                </div>
                            </label>

                            <label className="flex flex-col items-center space-y-4 cursor-pointer group p-6 bg-vintage-cream rounded-lg border-3 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg flex-1 min-w-[160px] md:min-w-[180px]">
                                <div className={`w-12 h-12 border-3 rounded flex items-center justify-center transition-all ${options.colorize ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.colorize && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.colorize} onChange={() => toggleOption('colorize')} />
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-vintage-brown block mb-2">🎨</span>
                                  <span className="text-sm md:text-base font-semibold text-vintage-brown">Nuspalvinti</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleRestore}
                        className="w-full mt-10 py-5 md:py-6 bg-vintage-brown text-vintage-cream font-bold text-lg md:text-xl rounded-lg shadow-xl hover:bg-vintage-sepia transition-all transform hover:scale-[1.02] active:scale-95 border-4 border-vintage-gold flex items-center justify-center min-h-[56px]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 mr-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Restauruoti Nuotrauką
                    </button>
                </div>
            )}

            {/* Image Display Area */}
            <div className="relative w-full max-w-5xl flex justify-center">
              {isProcessing ? (
                <div className="relative w-full max-w-4xl">
                    {/* Polaroid Frame Processing */}
                    <div className="bg-white p-8 shadow-2xl transform rotate-1 mx-auto" style={{ maxWidth: '90%' }}>
                      <div className="relative bg-vintage-paper border-4 border-vintage-sepia overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: '600px' }}>
                        <img src={originalImage} alt="Originalas" className="w-full h-full object-contain opacity-30 blur-sm" />

                        {/* Scanning Effect */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="w-full h-1/4 bg-gradient-to-b from-vintage-gold/0 via-vintage-gold/40 to-vintage-gold/0 absolute top-0 animate-scan"></div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-vintage-brown/70 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-vintage-gold mb-4"></div>
                            <p className="text-2xl font-display font-bold text-vintage-cream" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                                Restauruojama...
                            </p>
                            <p className="text-sm text-vintage-gold mt-2">Tai gali užtrukti kelias sekundes</p>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                          <p className="text-vintage-sepia font-bold italic text-lg">Jūsų prisiminimas atgimsta...</p>
                      </div>
                    </div>
                </div>
              ) : restoredImage ? (
                <div className="flex flex-col items-center w-full animate-in fade-in duration-1000">
                    <div className="bg-white p-8 md:p-12 shadow-2xl transform -rotate-1 w-full max-w-6xl">
                      <ComparisonSlider original={originalImage} restored={restoredImage} />
                      <div className="mt-8 text-center">
                          <p className="text-vintage-brown font-display font-bold text-3xl md:text-4xl mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                              ✓ Restauruota Sėkmingai
                          </p>
                          <p className="text-vintage-sepia text-sm md:text-base italic">Jūsų prisiminimas atgavo naują gyvenimą</p>
                      </div>
                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-2xl px-6">
                         <button
                            onClick={handleDownload}
                            className="flex-1 px-8 py-5 bg-vintage-gold text-vintage-brown font-bold text-base md:text-lg rounded-lg shadow-xl hover:bg-vintage-amber transition-all transform hover:scale-[1.02] flex items-center justify-center border-3 border-vintage-brown min-h-[56px]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" />
                            </svg>
                            Atsisiųsti Rezultatą
                        </button>
                        <button
                            onClick={() => setRestoredImage(null)}
                            className="flex-1 px-8 py-5 bg-vintage-paper text-vintage-brown font-semibold text-base md:text-lg rounded-lg shadow-md hover:bg-vintage-cream transition-all border-3 border-vintage-sepia min-h-[56px]"
                        >
                            Keisti Nustatymus
                        </button>
                    </div>
                </div>
              ) : (
                <div className="bg-white p-8 shadow-2xl transform rotate-1 w-full max-w-4xl">
                    <div className="bg-vintage-paper border-4 border-vintage-sepia overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: '600px' }}>
                      <img src={originalImage} alt="Peržiūra" className="w-full h-full object-contain" />
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-vintage-sepia font-bold italic text-lg">Originalas</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default App;
