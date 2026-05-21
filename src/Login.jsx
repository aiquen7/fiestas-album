import { useState } from 'react';
import FiestaBackground from './components/FiestaBackground';

export default function Login({ onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (firstName.trim() && lastName.trim()) {
      onLogin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    }
  };

  return (
    <FiestaBackground>
      <div className="flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-10 sm:pl-[min(22vw,180px)]">
        <div className="w-full max-w-xl rounded-2xl border border-fiesta-burgundy/25 bg-fiesta-cream-light/90 p-6 shadow-fiesta backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="font-script text-5xl leading-tight text-fiesta-burgundy sm:text-6xl">Mis 50 Karina</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm text-fiesta-burgundy/80">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-3xl border border-fiesta-burgundy/20 bg-fiesta-cream/80 px-5 py-4 text-fiesta-burgundy placeholder:text-fiesta-burgundy/40 focus:border-fiesta-blossom focus:outline-none focus:ring-2 focus:ring-fiesta-blossom/25 transition"
                placeholder="Ingresa tu nombre"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm text-fiesta-burgundy/80">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-3xl border border-fiesta-burgundy/20 bg-fiesta-cream/80 px-5 py-4 text-fiesta-burgundy placeholder:text-fiesta-burgundy/40 focus:border-fiesta-blossom focus:outline-none focus:ring-2 focus:ring-fiesta-blossom/25 transition"
                placeholder="Ingresa tu apellido"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-fiesta-blossom to-fiesta-burgundy px-6 py-4 text-base font-semibold text-fiesta-cream-light shadow-fiesta transition hover:scale-[1.01]"
            >
              Entrar al Evento
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-fiesta-burgundy/60">
            Tu nombre será visible en las fotos que subas.
          </p>
        </div>
      </div>
    </FiestaBackground>
  );
}
