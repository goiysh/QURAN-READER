import React, { useEffect, useState, useRef } from 'react';

export default function App() {
  const [surahs, setSurahs] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [arabicAyahs, setArabicAyahs] = useState([]);
  const [translationAyahs, setTranslationAyahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState('fr.hamidullah');
  const [dark, setDark] = useState(() => JSON.parse(localStorage.getItem('quran_dark') || 'false'));
  const [lastRead, setLastRead] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quran_last_read')) || null; } catch { return null; }
  });
  const audioRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('quran_dark', JSON.stringify(dark));
  }, [dark]);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(json => setSurahs(json.data || []))
      .catch(err => console.error('Erreur fetch surahs', err));
  }, []);

  useEffect(() => {
    if (selected) fetchSurah(selected.number);
  }, [selected, translation]);

  async function fetchSurah(number) {
    setLoading(true);
    setArabicAyahs([]);
    setTranslationAyahs([]);
    try {
      const arabicRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}/ar.alafasy`);
      const arabicJson = await arabicRes.json();
      setArabicAyahs(arabicJson.data.ayahs || []);

      const transRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}/${translation}`);
      const transJson = await transRes.json();
      setTranslationAyahs(transJson.data.ayahs || []);

      const lr = { number, name: selected.englishName || selected.name, timestamp: Date.now() };
      localStorage.setItem('quran_last_read', JSON.stringify(lr));
      setLastRead(lr);
    } catch (e) {
      console.error('Erreur fetch surah', e);
    } finally {
      setLoading(false);
    }
  }

  function openSurah(s) {
    setSelected(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function playAudio(url) {
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.play();
  }

  function playAll() {
    if (!arabicAyahs.length) return;
    let index = 0;
    if (!audioRef.current) audioRef.current = new Audio();

    const playNext = () => {
      if (index < arabicAyahs.length) {
        audioRef.current.src = arabicAyahs[index].audio;
        audioRef.current.play();
        index++;
        audioRef.current.onended = playNext;
      }
    };
    playNext();
  }

  const filtered = surahs.filter(s => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.englishName.toLowerCase().includes(q) || s.name.includes(q) || String(s.number) === q;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-5xl mx-auto p-4">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">📖 Quran Reader</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Lire le Coran — arabe, traduction, audio</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(d => !d)} className="py-1 px-3 rounded-lg border dark:border-gray-700">{dark ? '☀️ Light' : '🌙 Dark'}</button>
            <select 
              value={translation} 
              onChange={e=>setTranslation(e.target.value)} 
              className="py-1 px-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="fr.hamidullah">Français — Hamidullah</option>
              <option value="fr.darby">Français — Darby</option>
              <option value="en.sahih">English — Sahih International</option>
              <option value="en.yusufali">English — Yusuf Ali</option>
            </select>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* LISTE SOURATES */}
          <aside className="md:col-span-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
            <input 
              value={query} 
              onChange={e=>setQuery(e.target.value)} 
              placeholder="Recherche (nom ou numéro)" 
              className="w-full p-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <div className="space-y-2 max-h-[60vh] overflow-auto mt-3">
              {filtered.map(s => (
                <button key={s.number} onClick={()=>openSurah(s)} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.number}. {s.englishName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.name} · {s.numberOfAyahs} ayahs</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.revelationType}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {lastRead ? (
                <div>
                  <div className="font-medium">Dernière lecture :</div>
                  <div>{lastRead.name} (surah {lastRead.number})</div>
                </div>
              ) : (
                <div>Aucune lecture enregistrée.</div>
              )}
            </div>
          </aside>

          {/* AFFICHAGE SOURATE */}
          <section className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
            {!selected && (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold mb-2">As-salâm 'alaykum</h2>
                <p>Choisis une sourate à gauche pour l'afficher.</p>
              </div>
            )}

            {selected && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.englishName} — {selected.name}</h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Surah {selected.number} · {selected.revelationType} · {selected.numberOfAyahs} ayahs</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setSelected(null)} className="py-1 px-3 rounded border dark:border-gray-700">Fermer</button>
                    <button onClick={playAll} className="py-1 px-3 rounded border dark:border-gray-700">Lire toute</button>
                  </div>
                </div>

                {loading && <div className="text-center py-6">Chargement...</div>}

                {!loading && arabicAyahs.map((ayah, idx) => (
                  <div key={ayah.number} className="p-3 rounded border dark:border-gray-700 mb-3">
                    <div className="flex justify-between mb-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Ayah {ayah.numberInSurah}</div>
                      <button onClick={()=>playAudio(ayah.audio)} className="text-sm py-1 px-2 rounded border dark:border-gray-700">▶ Play</button>
                    </div>
                    <div className="text-2xl md:text-3xl leading-relaxed text-right">{ayah.text}</div>
                    <div className="mt-2 text-gray-700 dark:text-gray-300">{translationAyahs[idx]?.text}</div>
                  </div>
                ))}
              </>
            )}
          </section>
        </main>

        <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Données fournies par <span className="italic">AlQuran Cloud API</span>
        </footer>
      </div>
    </div>
  );
}
