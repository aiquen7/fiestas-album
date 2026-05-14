import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import imageCompression from 'browser-image-compression';

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

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido</h2>
            <p className="mb-4 text-center">Ingresa tu nombre y apellido</p>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre y Apellido"
            />
            <button
              onClick={handleSaveName}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-3xl font-bold">Fiestas Album</h1>
        <p className="text-gray-400">Comparte fotos en tiempo real</p>
      </header>

      {/* Photo Grid */}
      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url_foto}
                alt={`Foto de ${photo.nombre_usuario}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {photo.nombre_usuario}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Camera Button */}
      <button
        onClick={handleCameraClick}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition duration-300 z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
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
    </div>
  );
}

export default App;