import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import { convertImageToWebPLossless } from './lib/imageToWebPLossless';
import { Camera, ChevronDown, Loader2 } from 'lucide-react';
import Login from './Login';
import FiestaBackground from './components/FiestaBackground';

function App() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
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

  /**
   * Flujo de subida:
   * 1. Captura desde input (image/*)
   * 2. Conversión WebP lossless en el cliente (canvas + @jsquash/webp)
   * 3. Upload del Blob/File .webp a Supabase Storage
   * 4. Registro en tabla fotos
   */
  const handleFileInput = async (event) => {
    const files = event.target.files;
    if (!files?.length || !user || uploading) return;

    setErrorMessage('');
    setUploading(true);
    setUploadStatus('Subiendo imagen');

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      setErrorMessage('Seleccioná al menos una imagen válida.');
      setUploading(false);
      setUploadStatus('');
      event.target.value = '';
      return;
    }

    try {
      for (let index = 0; index < imageFiles.length; index += 1) {
        const originalFile = imageFiles[index];

        const { file: webpFile, fileName, originalSize, outputSize } =
          await convertImageToWebPLossless(originalFile);

        const { error: uploadError } = await supabase.storage
          .from('fotos_fiesta')
          .upload(fileName, webpFile, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData, error: publicUrlError } = supabase.storage
          .from('fotos_fiesta')
          .getPublicUrl(fileName);

        if (publicUrlError) throw publicUrlError;

        const { error: insertError } = await supabase.from('fotos').insert({
          url_foto: urlData.publicUrl,
          nombre_usuario: `${user.firstName} ${user.lastName}`.trim(),
        });

        if (insertError) throw insertError;

        console.info(
          `[WebP lossless] ${originalFile.name}: ${(originalSize / 1024).toFixed(0)} KB → ${(outputSize / 1024).toFixed(0)} KB`,
        );
      }
    } catch (error) {
      console.error('Error en pipeline de subida:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Hubo un problema al subir la imagen. Intenta de nuevo.',
      );
    } finally {
      setUploading(false);
      setUploadStatus('');
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <FiestaBackground>
      <div className="min-h-screen flex flex-col px-3 py-6 pb-32 sm:px-4 sm:py-8 sm:pb-36 sm:pl-[min(28vw,220px)]">
        <header className="mb-5 sm:mb-8">
          <div className="mx-auto max-w-5xl rounded-2xl border border-fiesta-burgundy/25 bg-fiesta-cream-light/85 p-4 shadow-fiesta backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
            <div className="text-center sm:text-right">
              <h1 className="font-script text-4xl leading-tight text-fiesta-burgundy sm:text-6xl">
                Mis 50 Karina
              </h1>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl">
          {uploading && (
            <div
              className="mb-6 flex items-center gap-3 rounded-3xl border border-fiesta-burgundy/30 bg-fiesta-cream-light/95 px-5 py-4 text-fiesta-burgundy shadow-fiesta"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-fiesta-blossom" />
              <p className="text-sm font-medium sm:text-base">{uploadStatus}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-3xl border border-fiesta-wine/30 bg-fiesta-wine/10 px-5 py-4 text-fiesta-burgundy-dark">
              {errorMessage}
            </div>
          )}

          {photos.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-fiesta-burgundy/20 bg-fiesta-cream-light/90 p-6 text-center shadow-fiesta sm:min-h-[450px] sm:rounded-[2rem] sm:p-10">
              <div>
                <p className="text-lg font-semibold text-fiesta-burgundy">Aún no hay fotos en la galería</p>
                <p className="mt-2 text-sm text-fiesta-burgundy/70">
                  Usa el botón de abajo para subir tu primera imagen del festejo.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {photos.map((photo) => (
                <article
                  key={photo.id}
                  className="group overflow-hidden rounded-xl border border-fiesta-burgundy/20 bg-fiesta-cream-light/95 shadow-fiesta transition-transform duration-300 hover:-translate-y-1 sm:rounded-2xl md:rounded-[2rem]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/5] md:aspect-auto md:h-64 lg:h-72">
                    <img
                      src={photo.url}
                      alt={`Foto de ${photo.uploadedBy.firstName} ${photo.uploadedBy.lastName}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fiesta-burgundy-dark/90 to-transparent px-2 py-2 text-fiesta-cream-light sm:px-4 sm:py-3">
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {photo.uploadedBy.firstName} {photo.uploadedBy.lastName}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-8 rounded-[2rem] border border-fiesta-burgundy/20 bg-fiesta-cream-light/90 p-8 text-center text-fiesta-burgundy/80">
              Cargando fotos... espera un momento.
            </div>
          )}
        </main>

        <div className="fixed bottom-5 left-1/2 z-20 flex w-full max-w-xs -translate-x-1/2 flex-col items-center gap-3 px-4 sm:bottom-8 sm:max-w-none sm:gap-4">
          <div className="text-center">
            <p
              className="mb-1 animate-bounce text-sm font-bold text-white sm:mb-2 sm:text-lg"
              style={{ textShadow: '0 1px 3px rgba(92, 0, 21, 0.9), 0 2px 12px rgba(92, 0, 21, 0.55)' }}
            >
              ¡Tú turno! Sube tu mejor momento
            </p>
            <ChevronDown
              className="mx-auto h-6 w-6 animate-bounce text-white"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(92, 0, 21, 0.9)) drop-shadow(0 2px 8px rgba(92, 0, 21, 0.5))' }}
            />
          </div>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fiesta-blossom to-fiesta-burgundy text-fiesta-cream-light shadow-[0_0_24px_rgba(128,0,32,0.45)] transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:w-16"
            aria-label="Subir foto"
            aria-busy={uploading}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Camera className="h-8 w-8" />
            )}
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
        disabled={uploading}
      />
    </FiestaBackground>
  );
}

export default App;
