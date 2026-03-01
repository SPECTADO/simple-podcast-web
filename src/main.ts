import './style.css';

// Client-side interactions can be added here
console.log('Static Podcast Web App Loaded');

// Theme Switcher Logic
const themeToggleButton = document.getElementById('theme-toggle');
const iconDark = document.getElementById('theme-icon-dark');
const iconLight = document.getElementById('theme-icon-light');

if (themeToggleButton && iconDark && iconLight) {
  // Check active theme
  const getTheme = () => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    if (document.documentElement.classList.contains('light')) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const updateIcon = () => {
    const theme = getTheme();
    if (theme === 'dark') {
      iconDark.style.display = 'none';
      iconLight.style.display = 'block';
    } else {
      iconDark.style.display = 'block';
      iconLight.style.display = 'none';
    }
  };

  // Initial setup
  updateIcon();

  // Toggle listener
  themeToggleButton.addEventListener('click', () => {
    const currentTheme = getTheme();
    if (currentTheme === 'dark') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateIcon();
  });
}

// Custom Audio Player Logic
const setupAudioPlayers = () => {
  const players = document.querySelectorAll('.custom-audio-wrapper');
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  players.forEach(wrapper => {
    const audio = wrapper.querySelector<HTMLAudioElement>('.hidden-audio');
    const playPauseBtn = wrapper.querySelector<HTMLButtonElement>('.play-pause-btn');
    const playIcon = wrapper.querySelector('.play-icon');
    const pauseIcon = wrapper.querySelector('.pause-icon');
    const progressBg = wrapper.querySelector<HTMLElement>('.progress-bg');
    const progressFg = wrapper.querySelector<HTMLElement>('.progress-fg');
    const timeCurrent = wrapper.querySelector<HTMLElement>('.time-current');
    const timeTotal = wrapper.querySelector<HTMLElement>('.time-total');

    if (!audio || !playPauseBtn || !progressBg || !progressFg || !timeCurrent || !timeTotal) return;

    // Load metadata
    audio.addEventListener('loadedmetadata', () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    // Play/Pause Toggle
    playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
        // Pause all other players first
        document.querySelectorAll<HTMLAudioElement>('.hidden-audio').forEach(a => {
          if (a !== audio && !a.paused) a.pause();
        });
        audio.play();
      } else {
        audio.pause();
      }
    });

    // Update UI on play/pause
    audio.addEventListener('play', () => {
      playIcon?.classList.add('hidden');
      pauseIcon?.classList.remove('hidden');
    });

    audio.addEventListener('pause', () => {
      playIcon?.classList.remove('hidden');
      pauseIcon?.classList.add('hidden');
    });

    // Time Update & Progress Bar
    audio.addEventListener('timeupdate', () => {
      timeCurrent.textContent = formatTime(audio.currentTime);
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFg.style.width = `${percent || 0}%`;
    });

    // Click to seek
    progressBg.addEventListener('click', (e) => {
      const rect = progressBg.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pos * audio.duration;
    });
  });
};

setupAudioPlayers();

// --- Internationalization (i18n) Logic ---
const translations: Record<string, Record<string, string>> = {
  en: {
    back: 'Back',
    subscribe: 'Subscribe',
    featured: 'Featured',
    latest_episodes: 'Latest Episodes',
    explore: 'Explore',
    bonus_content: 'Bonus Content',
    podcast: 'Podcast',
    play: 'Play',
  },
  cs: {
    back: 'Zpět',
    subscribe: 'Odebírat',
    featured: 'Doporučené',
    latest_episodes: 'Nejnovější epizody',
    explore: 'Prozkoumat',
    bonus_content: 'Bonusový obsah',
    podcast: 'Podcast',
    play: 'Přehrát',
  },
  de: {
    back: 'Zurück',
    subscribe: 'Abonnieren',
    featured: 'Empfohlen',
    latest_episodes: 'Neueste Folgen',
    explore: 'Entdecken',
    bonus_content: 'Bonus-Inhalte',
    podcast: 'Podcast',
    play: 'Abspielen',
  },
  fr: {
    back: 'Retour',
    subscribe: "S'abonner",
    featured: 'En vedette',
    latest_episodes: 'Derniers épisodes',
    explore: 'Explorer',
    bonus_content: 'Contenu bonus',
    podcast: 'Podcast',
    play: 'Lire',
  },
  es: {
    back: 'Volver',
    subscribe: 'Suscribirse',
    featured: 'Destacado',
    latest_episodes: 'Últimos episodios',
    explore: 'Explorar',
    bonus_content: 'Contenido extra',
    podcast: 'Podcast',
    play: 'Reproducir',
  },
  it: {
    back: 'Indietro',
    subscribe: 'Iscriviti',
    featured: 'In primo piano',
    latest_episodes: 'Ultimi episodi',
    explore: 'Esplora',
    bonus_content: 'Contenuti bonus',
    podcast: 'Podcast',
    play: 'Riproduci',
  },
  pl: {
    back: 'Wstecz',
    subscribe: 'Subskrybuj',
    featured: 'Polecane',
    latest_episodes: 'Najnowsze odcinki',
    explore: 'Odkrywaj',
    bonus_content: 'Treści bonusowe',
    podcast: 'Podcast',
    play: 'Odtwórz',
  }
};

const setLanguage = (lang: string) => {
  const dictionary = translations[lang] || translations.en;
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (key && dictionary[key]) {
      el.textContent = dictionary[key];
    }
  });

  // Localize dates
  document.querySelectorAll('[data-date]').forEach(el => {
    const timestamp = el.getAttribute('data-date');
    if (timestamp) {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        el.textContent = new Intl.DateTimeFormat(lang, {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(date);
      }
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('language', lang);
  
  // Update select value if exists
  const langSelect = document.getElementById('language-select') as HTMLSelectElement;
  if (langSelect) langSelect.value = lang;
};

// Initialization logic for i18n
const initI18n = () => {
  const feedLang = document.body.getAttribute('data-feed-language');
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language.split('-')[0];
  
  // Priority: Feed Language (Locked) > Saved Preference > Browser Language > Default (EN)
  const initialLang = feedLang || savedLang || (translations[browserLang] ? browserLang : 'en');
  
  setLanguage(initialLang);

  const langSelect = document.getElementById('language-select');
  if (langSelect && !feedLang) { // Only add listener if not locked
    langSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      setLanguage(target.value);
    });
  }
};

initI18n();
