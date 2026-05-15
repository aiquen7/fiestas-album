import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import imageCompression from 'browser-image-compression';
import { Camera, User, Clock } from 'lucide-react';

function App() {
  const [userName, setUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [inputName, setInputName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      setIsModalOpen(true);
    }

    // Fetch initial photos
    fetchPhotos();

    // Setup realtime
    const channel = supabase
      .channel('fotos_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fotos' }, (payload) => {
        setPhotos(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setPhotos(data);
  };

  const handleSaveName = () => {
    if (inputName.trim()) {
      localStorage.setItem('user_name', inputName.trim());
      setUserName(inputName.trim());
      setIsModalOpen(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${compressedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('fotos_fiesta')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('fotos_fiesta')
        .getPublicUrl(fileName);

      // Insert into database
      const { error: insertError } = await supabase
        .from('fotos')
        .insert([{ nombre_usuario: userName, url_foto: urlData.publicUrl }]);

      if (insertError) throw insertError;

      // Reset input
      event.target.value = null;
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `hace ${Math.floor(diffInSeconds / 86400)} d`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
      {/* Gradientes radiales de fondo */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/20 via-transparent to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent opacity-50" style={{ backgroundPosition: 'bottom right' }}></div>

      {/* Modal de bienvenida */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido</h2>
            <p className="mb-6 text-center text-white/80">Ingresa tu nombre y apellido</p>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Nombre y Apellido"
            />
            <button
              onClick={handleSaveName}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 text-center">
          <h1 className="text-2xl font-bold">¡Qué bueno verte, {userName}!</h1>
          <p className="text-white/70 mt-2">Comparte fotos en tiempo real</p>
        </div>
      </header>

      {/* Galería Bento Grid */}
      <main className="relative z-10 px-4 pb-24">
        <div className="columns-2 gap-3 space-y-3">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid relative group">
              <img
                src={photo.url_foto}
                alt={`Foto de ${photo.nombre_usuario}`}
                className="w-full rounded-2xl shadow-xl object-cover transition-opacity duration-500"
                style={{ aspectRatio: '1' }}
                onLoad={(e) => e.target.style.opacity = '1'}
                onError={(e) => e.target.style.opacity = '0.5'}
              />
              {/* Badge de usuario */}
              <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">{photo.nombre_usuario}</span>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Clock className="w-3 h-3" />
                  <span>{getRelativeTime(photo.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB con glow */}
      <button
        onClick={handleCameraClick}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-5 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition duration-300 z-40 glow-effect"
      >
        <Camera className="w-8 h-8" />
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Estilos adicionales para glow */}
      <style jsx>{`
        .glow-effect {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3);
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

export default App;