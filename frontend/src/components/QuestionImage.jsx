// components/QuestionImage.jsx
//
// Renders a question's image with graceful loading and error states.
// Used both during active gameplay and on the result screen. Wraps the
// native <img> element with loading UI, error fallback, and consistent
// sizing so the layout doesn't jump as images load.
//
// Accessibility: by default alt="" (decorative). Callers can pass an
// explicit alt prop for images whose content is meaningful to the
// question — though in practice, quiz image content IS the answer, so
// decorative is usually correct.
import { useState } from 'react';

export default function QuestionImage({ src, alt = '', size = 'lg' }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  // Pre-computed Tailwind classes for each size. Using concrete classes
  // (not string-interpolated) so Tailwind's purge-aware build keeps them.
  const sizeClass = {
    lg: 'max-h-64 aspect-video',
    sm: 'max-h-32 aspect-video',
  }[size];

  // Skeleton and error boxes use the same dimensions as a loaded image
  // so the layout doesn't shift between states.
  const boxClass =
    'w-full rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center';

  if (status === 'error') {
    return (
      <div
        className={`${boxClass} ${sizeClass} bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400`}
        role="img"
        aria-label="Image unavailable"
      >
        Image could not be loaded
      </div>
    );
  }

  return (
    <div className="relative">
      {status === 'loading' && (
        <div
          className={`${boxClass} ${sizeClass} bg-slate-100 dark:bg-slate-800 animate-pulse`}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        // Hide the img element while loading so only the skeleton shows.
        // Can't use `hidden` or `display: none` — some browsers skip the
        // fetch. Opacity keeps it laid out (and fetching) but invisible.
        className={`${sizeClass} w-full object-contain rounded border border-slate-200 dark:border-slate-700 ${
          status === 'loading' ? 'absolute inset-0 opacity-0' : ''
        }`}
      />
    </div>
  );
}