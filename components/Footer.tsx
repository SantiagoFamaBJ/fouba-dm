export default function Footer({ legal }: { legal?: string }) {
  return (
    <footer className="bg-[#f15922] text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <img src="/logo-dm-blanco.png" alt="Dental Medrano" className="h-10 w-auto" />
        {legal && <p className="max-w-md text-sm leading-relaxed text-white/90">{legal}</p>}
        <div className="flex flex-col items-center gap-2 text-sm font-semibold sm:items-start">
          <a href="https://instagram.com/dentalmedrano" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @dentalmedrano
          </a>
          <a href="https://www.dentalmedrano.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
            </svg>
            www.dentalmedrano.com
          </a>
        </div>
      </div>
    </footer>
  );
}
