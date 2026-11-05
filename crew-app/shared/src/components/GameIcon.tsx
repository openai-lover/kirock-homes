type Name = 'sound' | 'quiet' | 'motion' | 'upload' | 'play' | 'search' | 'folder' | 'book';
export default function GameIcon({name}: {name: Name}) {
  const paths: Record<Name,string> = {
    sound: 'M11 5 6 9H3v6h3l5 4V5ZM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14',
    quiet: 'M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6',
    motion: 'M12 3a9 9 0 1 0 9 9M12 3v4m5-2-2 3m5 2-3 1',
    upload: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
    play: 'm9 5 10 7-10 7V5Z',
    search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1.5 4.5L21 21M7 7c1-1 2-1.5 3-1.5',
    folder: 'M3 7V4h6l3 3h9v13H3V7Zm0 3h18',
    book: 'M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15M5 8l3 1M5 12l3 1m8-4 3-1m-3 5 3-1',
  };
  return <svg className="game-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
