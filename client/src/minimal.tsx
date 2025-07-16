import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function MinimalApp() {
  return (
    <div>
      <h1>Minimal React App</h1>
      <p>Testing React setup</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinimalApp />
  </StrictMode>,
); 