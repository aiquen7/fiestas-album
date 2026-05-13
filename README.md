# Fiestas Album

Una aplicación de fotos de eventos en tiempo real usando React, Tailwind CSS y Supabase.

## Características

- Autenticación simple con localStorage
- Captura de fotos desde la cámara
- Compresión de imágenes antes de subir
- Feed en tiempo real con Supabase
- Diseño dark mode con Tailwind CSS

## Instalación

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Copia `.env.example` a `.env` y configura tus credenciales de Supabase
4. Ejecuta: `npm start`

## Configuración de Supabase

- Crea un proyecto en Supabase
- Crea un bucket llamado `fotos_fiesta` con permisos públicos
- Crea una tabla `fotos` con columnas:
  - `id` (uuid, primary key)
  - `nombre_usuario` (text)
  - `url_foto` (text)
  - `created_at` (timestamp)

Habilita RLS si es necesario, pero para simplicidad, permite inserts públicos.