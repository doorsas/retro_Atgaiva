import React, { useCallback, useState } from 'react';

interface ImageDropzoneProps {
  onImageSelected: (base64: string) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onImageSelected(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center w-full max-w-2xl h-96 border-4 border-dashed rounded-lg transition-all duration-300 ease-out shadow-2xl
        ${isDragging
            ? 'border-vintage-gold bg-vintage-gold/20 scale-[1.02] shadow-vintage-gold/50'
            : 'border-vintage-sepia bg-vintage-paper hover:border-vintage-gold hover:shadow-vintage-gold/30'
        }`}
      style={{
        backgroundImage: `
          linear-gradient(45deg, transparent 48%, rgba(166, 124, 82, 0.1) 49%, rgba(166, 124, 82, 0.1) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(166, 124, 82, 0.1) 49%, rgba(166, 124, 82, 0.1) 51%, transparent 52%)
        `,
        backgroundSize: '20px 20px'
      }}
    >
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* Vintage Corner Decorations */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-vintage-brown opacity-50"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-vintage-brown opacity-50"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-vintage-brown opacity-50"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-vintage-brown opacity-50"></div>

      <div className="flex flex-col items-center justify-center space-y-6 text-center p-8 transition-transform duration-300 group-hover:-translate-y-2 relative z-0">
        <div className={`p-6 rounded-full shadow-xl transition-all duration-300 border-4 ${isDragging ? 'bg-vintage-gold border-vintage-brown scale-110' : 'bg-vintage-brown border-vintage-gold group-hover:scale-110'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14 text-vintage-cream">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold text-vintage-brown mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {isDragging ? 'Paleiskite nuotrauką čia!' : 'Įkelkite savo seną nuotrauką'}
          </p>
          <p className="text-sm text-vintage-sepia font-semibold uppercase tracking-wider border-t-2 border-b-2 border-vintage-gold py-2 px-4 inline-block">
            Vilkite arba spustelėkite čia
          </p>
          <p className="text-xs text-vintage-brown/70 mt-3 italic">
            Palaikomi formatai: JPEG, PNG, WebP
          </p>
        </div>

        {/* Vintage film strip decoration */}
        <div className="flex items-center space-x-1 opacity-40">
          <div className="w-2 h-2 bg-vintage-brown rounded-full"></div>
          <div className="w-12 h-1 bg-vintage-sepia"></div>
          <div className="w-2 h-2 bg-vintage-brown rounded-full"></div>
          <div className="w-12 h-1 bg-vintage-sepia"></div>
          <div className="w-2 h-2 bg-vintage-brown rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageDropzone;
