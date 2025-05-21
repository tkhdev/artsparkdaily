import React, { useEffect } from 'react';
import { analytics, logEvent } from './firebase-config';

function App() {
  useEffect(() => {
    // Log a page view event correctly
    logEvent(analytics, 'page_view');
  }, []);

  return (
    <div>
      <h1>Welcome to ArtSparkDaily</h1>
    </div>
  );
}

export default App;
