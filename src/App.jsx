import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import imageCompression from 'browser-image-compression';
import { Camera, ChevronDown, User } from 'lucide-react';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchPhotos();

    const channel = supabase
      .channel('fotos_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fotos' }, (payload) => {
        setPhotos((prev) => [mapPhoto(payload.new), ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mapPhoto = (row) => {
    const url = row.url || row.url_foto || '';
    const uploadedAt = row.created_at || new Date().toISOString();
    const fullName =
      typeof row.nombre_usuario === 'string'
        ? row.nombre_usuario
        : row.uploaded_by
        ? `${row.uploaded_by.firstName ?? ''} ${row.uploaded_by.lastName ?? ''}`.trim()
        : 'Invitado';

    const [firstName, ...lastParts] = fullName.split(' ');

    return {
      id: row.id?.toString() ?? `${Date.now()}-${Math.random()}`,
      url,
      uploadedAt,
      uploadedBy: {
        firstName: firstName || 'Invitado',
        lastName: lastParts.join(' '),
      },
    };
  };

  const fetchPhotos = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);
      setErrorMessage('No se pudieron cargar las fotos. Intenta de nuevo.');
      return;
    }

    setPhotos((data ?? []).map(mapPhoto));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleFileInput = async (event) => {
    const files = event.target.files;
    if (!files || !user) return;

    setErrorMessage('');

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const fileName = `${Date.now()}-${Math.random()}.${compressedFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('fotos_fiesta')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: urlData, error: publicUrlError } = await supabase.storage
          .from('fotos_fiesta')
          .getPublicUrl(fileName);

        if (publicUrlError) throw publicUrlError;

        const { error: insertError } = await supabase
          .from('fotos')
          .insert({
            url_foto: urlData.publicUrl,
            nombre_usuario: `${user.firstName} ${user.lastName}`.trim(),
          });

        if (insertError) throw insertError;

        event.target.value = null;
      } catch (error) {
        console.error('Error uploading photo:', error);
        setErrorMessage('Hubo un problema al subir la imagen. Intenta de nuevo.');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8">
        <header className="mb-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Fiesta Album</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Mis 50 Karina</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Álbum colaborativo para reunir las mejores fotos del evento en un mismo lugar. Comparte momentos en vivo con estilo y elegancia.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fotos cargadas</p>
                  <p className="mt-2 text-3xl font-bold text-white">{photos.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bienvenido</p>
                  <p className="mt-2 text-3xl font-bold text-white">{user.firstName} {user.lastName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl">
          {errorMessage && (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-100">
              {errorMessage}
            </div>
          )}

          {photos.length === 0 ? (
            <div className="flex min-h-[450px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/50">
              <div>
                <p className="text-lg font-semibold text-white">Aún no hay fotos en la galería</p>
                <p className="mt-2 text-sm text-slate-400">Usa el botón de abajo para subir tu primera imagen del festejo.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={`Foto de ${photo.uploadedBy.firstName} ${photo.uploadedBy.lastName}`}
                      className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-4 text-white">
                      <p className="text-sm font-semibold">{photo.uploadedBy.firstName} {photo.uploadedBy.lastName}</p>
                      <p className="mt-1 text-xs text-slate-300">{getRelativeTime(photo.uploadedAt)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-center text-slate-300">
              Cargando fotos... espera un momento.
            </div>
          )}
        </main>

        <div className="fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-white font-black text-lg mb-2 animate-bounce">¡TÚ TURNO! SUBE TU MEJOR MOMENTO</p>
            <ChevronDown className="w-6 h-6 text-cyan-400 mx-auto animate-bounce" />
          </div>
          <button
            onClick={handleUploadClick}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-transform duration-200 hover:scale-110"
            aria-label="Subir foto"
          >
            <Camera className="h-8 w-8" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}

export default App;
