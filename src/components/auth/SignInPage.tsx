import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo & branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-white font-black text-3xl">M</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              MEMORA
            </h1>
            <p className="text-sm text-neutral-400 font-medium tracking-wide uppercase mt-0.5">
              Répétition Espacée Intelligente
            </p>
          </div>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#111113',
              colorText: '#f5f5f5',
              colorTextSecondary: '#a3a3a3',
              colorInputBackground: '#1c1c1f',
              colorInputText: '#f5f5f5',
              borderRadius: '0.75rem',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            },
            elements: {
              card: 'bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 shadow-2xl shadow-black/50',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-neutral-400',
              socialButtonsBlockButton:
                'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white transition-colors',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-neutral-700',
              dividerText: 'text-neutral-500',
              formFieldLabel: 'text-neutral-300 font-medium',
              formFieldInput:
                'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-indigo-500/20',
              formButtonPrimary:
                'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300',
              identityPreviewText: 'text-neutral-200',
              identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300',
            },
          }}
        />
      </div>
    </div>
  );
};
