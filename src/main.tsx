import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Personal API key: attach X-Umami-Key to all /api requests
const ORIGINAL_FETCH = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input as Request).url);
    const key = localStorage.getItem('umami_api_key');
    if (key && typeof url === 'string' && url.includes('/api/')) {
      const headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined));
      headers.set('X-Umami-Key', key);
      init = { ...(init || {}), headers };
    }
  } catch (e) {
    // ignore wrapper errors
  }
  return ORIGINAL_FETCH(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
