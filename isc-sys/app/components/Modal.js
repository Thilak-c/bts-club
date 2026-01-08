'use client';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
