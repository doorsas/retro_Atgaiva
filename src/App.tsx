import React, { useState, useCallback } from 'react';
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
          <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in zoom-in duration-500">
            <div className="text-center max-w-2xl mb-12">
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-vintage-sepia rounded-full flex items-center justify-center shadow-2xl border-8 border-vintage-gold transform rotate-12 animate-flicker">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-vintage-cream">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl font-display font-bold text-vintage-brown mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                Prikelkite senus prisiminimus
              </h2>
              <p className="text-lg text-vintage-sepia leading-relaxed border-l-4 border-vintage-gold pl-4 italic">
                "Kiekviena nuotrauka - tai langas į praeitį. Leiskite mums ją atverti platčiai su modernių technologijų pagalba."
              </p>
            </div>

            <ImageDropzone onImageSelected={handleImageSelected} />

            {/* Vintage Feature Badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <div className="px-5 py-2 bg-vintage-paper border-2 border-vintage-sepia rounded shadow-md transform -rotate-1 hover:rotate-0 transition-transform">
                <span className="text-sm font-semibold text-vintage-brown">📷 Senų nuotraukų restauravimas</span>
              </div>
              <div className="px-5 py-2 bg-vintage-paper border-2 border-vintage-sepia rounded shadow-md transform rotate-1 hover:rotate-0 transition-transform">
                <span className="text-sm font-semibold text-vintage-brown">🎨 Automatinis spalvinimas</span>
              </div>
              <div className="px-5 py-2 bg-vintage-paper border-2 border-vintage-sepia rounded shadow-md transform -rotate-1 hover:rotate-0 transition-transform">
                <span className="text-sm font-semibold text-vintage-brown">✨ Įbrėžimų šalinimas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Restoration Controls */}
            {!restoredImage && !isProcessing && (
                <div className="w-full max-w-4xl mb-8 p-8 bg-vintage-paper rounded-lg border-4 border-vintage-sepia shadow-2xl">
                    <div className="mb-6 text-center">
                      <h3 className="text-3xl font-display font-bold text-vintage-brown mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                        Restauravimo Nustatymai
                      </h3>
                      <div className="h-1 w-32 bg-vintage-gold mx-auto"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap justify-center gap-6">
                             <label className="flex flex-col items-center space-y-3 cursor-pointer group p-4 bg-vintage-cream rounded-lg border-2 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg min-w-[160px]">
                                <div className={`w-8 h-8 border-3 rounded flex items-center justify-center transition-all ${options.fixDamage ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.fixDamage && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.fixDamage} onChange={() => toggleOption('fixDamage')} />
                                <div className="text-center">
                                  <span className="text-lg font-bold text-vintage-brown block">🔧</span>
                                  <span className="text-sm font-semibold text-vintage-brown">Taisyti pažeidimus</span>
                                </div>
                            </label>

                             <label className="flex flex-col items-center space-y-3 cursor-pointer group p-4 bg-vintage-cream rounded-lg border-2 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg min-w-[160px]">
                                <div className={`w-8 h-8 border-3 rounded flex items-center justify-center transition-all ${options.enhanceDetails ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.enhanceDetails && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.enhanceDetails} onChange={() => toggleOption('enhanceDetails')} />
                                <div className="text-center">
                                  <span className="text-lg font-bold text-vintage-brown block">🔍</span>
                                  <span className="text-sm font-semibold text-vintage-brown">Paryškinti detales</span>
                                </div>
                            </label>

                            <label className="flex flex-col items-center space-y-3 cursor-pointer group p-4 bg-vintage-cream rounded-lg border-2 border-vintage-brown hover:border-vintage-gold transition-all hover:shadow-lg min-w-[160px]">
                                <div className={`w-8 h-8 border-3 rounded flex items-center justify-center transition-all ${options.colorize ? 'bg-vintage-gold border-vintage-brown' : 'border-vintage-brown bg-white'}`}>
                                    {options.colorize && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-vintage-brown"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={options.colorize} onChange={() => toggleOption('colorize')} />
                                <div className="text-center">
                                  <span className="text-lg font-bold text-vintage-brown block">🎨</span>
                                  <span className="text-sm font-semibold text-vintage-brown">Nuspalvinti</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleRestore}
                        className="w-full mt-8 py-4 bg-vintage-brown text-vintage-cream font-bold text-xl rounded-lg shadow-xl hover:bg-vintage-sepia transition-all transform hover:scale-105 active:scale-95 border-4 border-vintage-gold flex items-center justify-center"
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
                    <div className="bg-white p-8 shadow-2xl transform -rotate-1 w-full max-w-5xl">
                      <ComparisonSlider original={originalImage} restored={restoredImage} />
                      <div className="mt-6 text-center">
                          <p className="text-vintage-brown font-display font-bold text-2xl mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                              ✓ Restauruota Sėkmingai
                          </p>
                      </div>
                    </div>
                    <div className="mt-8 flex space-x-4">
                         <button
                            onClick={handleDownload}
                            className="px-8 py-4 bg-vintage-gold text-vintage-brown font-bold text-lg rounded-lg shadow-xl hover:bg-vintage-amber transition-all transform hover:scale-105 flex items-center border-2 border-vintage-brown"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" />
                            </svg>
                            Atsisiųsti Rezultatą
                        </button>
                        <button
                            onClick={() => setRestoredImage(null)}
                            className="px-8 py-4 bg-vintage-paper text-vintage-brown font-semibold text-lg rounded-lg shadow-md hover:bg-vintage-cream transition-all border-2 border-vintage-sepia"
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
  );
};

export default App;
