import React from 'react';
import {createRoot} from 'react-dom/client';
import Game from '../shared/src/components/Game';
import '../shared/src/app/globals.css';
const originalFetch=window.fetch.bind(window);
window.fetch=(input,init)=>originalFetch(typeof input==='string'&&input.startsWith('/api/')?'/apps/kirock-homes'+input:input,init);
createRoot(document.getElementById('root')!).render(<Game crewMode/>);
