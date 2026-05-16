import { useState } from 'react';
import { UserCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-cyan-500/15 mb-4">
            <UserCircle className="w-12 h-12 text-cyan-300" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Fiesta Album</h1>
          <p className="mt-3 text-sm text-slate-400">Accede al álbum del evento y sube tus recuerdos con estilo.</p>
          <p className="text-slate-500 text-xs mt-1">13 de Mayo 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm text-slate-400 mb-2">
              Nombre
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm text-slate-400 mb-2">
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition"
              placeholder="Ingresa tu apellido"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Entrar al Evento
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-8">
          Tu nombre será visible en las fotos que subas.
        </p>
      </div>
    </div>
  );
}
