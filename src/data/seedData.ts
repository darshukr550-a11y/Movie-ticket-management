import type { Movie, Show, ShowSeatLock, Theatre } from '../types.ts';
import { getUpcomingDates } from '../utils/cinema.ts';

export const SEED_MOVIES: Movie[] = [
  {
    movie_id: 'mov_obsidian_horizon',
    title: 'Obsidian Horizon',
    genre: 'Sci-Fi / Thriller',
    duration: '2h 28m',
    rating: 8.9,
    language: 'English',
    releaseDate: '2026-11-13',
    certificate: 'UA',
    description:
      'When an orbital megastructure around Kepler-186f begins broadcasting a countdown older than human civilization, mission commander Elena Vance descends through volatile atmospheric storms to decode the signal before Earth loses telemetry forever.',
    posterUrl: '/src/assets/images/poster_obsidian_horizon_1795491656675.jpg',
    bannerUrl: '/src/assets/images/hero_obsidian_horizon_1795491655967.jpg',
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    cast: ['Elena Vance — Clara Sterling', 'Dr. Arjun Nair — Dev Patel', 'Cmdr. Marcus Kael — Oscar Isaac'],
    crew: ['Director: Denis Villeneuve-K', 'Score: Ludwig Goransson', 'Cinematography: Greig Fraser'],
    formats: ['IMAX 2D', 'Dolby Atmos', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: true,
    featured: true,
  },
  {
    movie_id: 'mov_aarambham',
    title: 'Aarambham: The Last Sovereign',
    genre: 'Historical / Action',
    duration: '2h 42m',
    rating: 9.1,
    language: 'Hindi',
    releaseDate: '2026-11-06',
    certificate: 'UA',
    description:
      'Set along the fortified Deccan plateau of the 14th century, an exiled general unites fractured mountain clans to defend the ancient granite citadel against an overwhelming imperial siege.',
    posterUrl: '/src/assets/images/poster_aarambham_sovereign_1795491657393.jpg',
    bannerUrl: '/src/assets/images/poster_aarambham_sovereign_1795491657393.jpg',
    trailerUrl: 'https://www.youtube.com/embed/f_vbAtFSEc0',
    cast: ['Rana Pratap — Vikramaditya Rao', 'Queen Devika — Sobhita D.', 'General Rudra — Rana Daggubati'],
    crew: ['Director: S. S. Rajendra', 'Music: M. M. Keeravaani', 'Action: Peter Hein'],
    formats: ['IMAX 2D', '4DX', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_midnight_kyoto',
    title: 'Midnight in Kyoto',
    genre: 'Neo-Noir / Mystery',
    duration: '1h 58m',
    rating: 8.6,
    language: 'Japanese',
    releaseDate: '2026-11-18',
    certificate: 'A',
    description:
      'A disgraced acoustic forensics specialist is summoned to a rain-drenched Kyoto district after a rare 1968 vinyl master vanishes alongside three witnesses during the autumn lantern festival.',
    posterUrl: '/src/assets/images/poster_midnight_kyoto_1795491658162.jpg',
    bannerUrl: '/src/assets/images/poster_midnight_kyoto_1795491658162.jpg',
    trailerUrl: 'https://www.youtube.com/embed/gCcx85zbxz4',
    cast: ['Kenji Sato — Hidetoshi Nishijima', 'Aoi Takahashi — Sakura Ando', 'Inspector Mori — Ken Watanabe'],
    crew: ['Director: Hirokazu Kore-eda', 'Cinematography: Roger Deakins', 'Editor: Mikkel E. G. Nielsen'],
    formats: ['2D', 'Dolby Atmos'],
    status: 'now_showing',
    trending: true,
    recommended: false,
    featured: false,
  },
  {
    movie_id: 'mov_velvet_frequencies',
    title: 'Velvet Frequencies',
    genre: 'Musical / Drama',
    duration: '2h 12m',
    rating: 8.4,
    language: 'English',
    releaseDate: '2026-11-15',
    certificate: 'UA',
    description:
      'Over one winter season inside an underground Mumbai-meets-London jazz room, two rival composers confront past betrayals while recording a live analog album that could save their crumbling venue.',
    posterUrl: '/src/assets/images/poster_velvet_frequencies_1795491657487.jpg',
    bannerUrl: '/src/assets/images/poster_velvet_frequencies_1795491657487.jpg',
    trailerUrl: 'https://www.youtube.com/embed/0pdqf4P9MB8',
    cast: ['Nadia Thorne — Emma Stone', 'Julian Mercer — Miles Teller', 'Artie Shaw — J. K. Simmons'],
    crew: ['Director: Damien Chazelle', 'Original Jazz Score: Justin Hurwitz', 'Sound: Dolby Studios'],
    formats: ['Dolby Atmos', '2D'],
    status: 'now_showing',
    trending: false,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_kaveri_express',
    title: 'Kaveri Express',
    genre: 'Action / Thriller',
    duration: '2h 34m',
    rating: 8.8,
    language: 'Tamil',
    releaseDate: '2026-11-10',
    certificate: 'UA',
    description:
      'Hurtling across mist-choked Western Ghats viaducts during a cyclonic blackout, a veteran locomotive engineer races to disarm an encrypted cargo heist aboard the overnight Kaveri Express.',
    posterUrl: '/src/assets/images/poster_kaveri_express_1795491659303.jpg',
    bannerUrl: '/src/assets/images/poster_kaveri_express_1795491659303.jpg',
    trailerUrl: 'https://www.youtube.com/embed/eOrNdBpGMv8',
    cast: ['Kathiravan — Karthi Sivakumar', 'Meera — Trisha Krishnan', 'Vetri — Fahadh Faasil'],
    crew: ['Director: Lokesh Kanagaraj', 'Music: Anirudh Ravichander', 'Stunts: Anbariv'],
    formats: ['IMAX 2D', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_clockmakers_paradox',
    title: "The Clockmaker's Paradox",
    genre: 'Adventure / Fantasy',
    duration: '2h 15m',
    rating: 8.2,
    language: 'English',
    releaseDate: '2026-11-20',
    certificate: 'U',
    description:
      'Inside a subterranean astronomical observatory powered by century-old brass gears, a young horologist discovers an astrolabe that rewinds sixty seconds of reality with every chime.',
    posterUrl: '/src/assets/images/poster_clockmakers_paradox_1795491659388.jpg',
    bannerUrl: '/src/assets/images/poster_clockmakers_paradox_1795491659388.jpg',
    trailerUrl: 'https://www.youtube.com/embed/5iaYLCiq5RM',
    cast: ['Lyra Vance — Millie Bobby Brown', 'Master Bell — Benedict Cumberbatch', 'Theo — Asa Butterfield'],
    crew: ['Director: Alfonso Cuaron', 'Production Design: Stuart Craig', 'VFX: Framestore'],
    formats: ['3D', 'IMAX 3D', '2D'],
    status: 'now_showing',
    trending: false,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_monsoon_letters',
    title: 'Monsoon Letters',
    genre: 'Romance / Drama',
    duration: '2h 06m',
    rating: 8.7,
    language: 'Malayalam',
    releaseDate: '2026-11-12',
    certificate: 'U',
    description:
      'Separated for seven monsoons after a coastal ferry accident, a marine cartographer and a tea-house archivist reconnect through unsent letters washed ashore in Alleppey.',
    posterUrl: '/src/assets/images/poster_monsoon_letters_1795491660771.jpg',
    bannerUrl: '/src/assets/images/poster_monsoon_letters_1795491660771.jpg',
    trailerUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c',
    cast: ['Aravind — Dulquer Salmaan', 'Charulatha — Sai Pallavi', 'Capt. Thomas — Mammootty'],
    crew: ['Director: Jeethu Joseph', 'Music: Sushin Shyam', 'Cinematography: Shyju Khalid'],
    formats: ['2D'],
    status: 'now_showing',
    trending: false,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_apex_circuit',
    title: 'Apex Circuit',
    genre: 'Sports / Action',
    duration: '2h 20m',
    rating: 8.5,
    language: 'English',
    releaseDate: '2026-11-19',
    certificate: 'UA',
    description:
      'An independent motorsport constructor risks bankruptcy and personal rivalry to field a ground-up hybrid prototype at the rain-lashed Singapore midnight street grand prix.',
    posterUrl: '/src/assets/images/poster_apex_circuit_1795491660693.jpg',
    bannerUrl: '/src/assets/images/poster_apex_circuit_1795491660693.jpg',
    trailerUrl: 'https://www.youtube.com/embed/6ZfuNTqbHE8',
    cast: ['Cole Mercer — Brad Pitt', 'Rohan Verma — Vikrant Massey', 'Claire Vance — Rebecca Ferguson'],
    crew: ['Director: Joseph Kosinski', 'Cinematography: Claudio Miranda', 'Sound: Skywalker Sound'],
    formats: ['4DX', 'IMAX 2D', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: false,
    featured: false,
  },
  {
    movie_id: 'mov_garuda_skybound',
    title: 'Garuda: Skybound',
    genre: 'Animation / Family',
    duration: '1h 48m',
    rating: 8.3,
    language: 'Hindi',
    releaseDate: '2026-12-11',
    certificate: 'U',
    description:
      'A spirited young glider apprentice befriends an ancient clockwork sunbird above floating cloud sanctuaries, embarking on a skyward quest to restore the seasonal trade winds.',
    posterUrl: '/src/assets/images/poster_garuda_skybound_1795491662377.jpg',
    bannerUrl: '/src/assets/images/poster_garuda_skybound_1795491662377.jpg',
    trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE',
    cast: ['Voice: Ishaan Khatter', 'Voice: Alia Bhatt', 'Voice: Naseeruddin Shah'],
    crew: ['Director: Gitanjali Rao', 'Music: Amit Trivedi', 'Animation: Prism Works'],
    formats: ['3D', '2D'],
    status: 'coming_soon',
    trending: false,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_silent_meridian',
    title: 'Silent Meridian',
    genre: 'Espionage / Thriller',
    duration: '2h 25m',
    rating: 9.0,
    language: 'English',
    releaseDate: '2026-12-18',
    certificate: 'UA',
    description:
      'Submerged beneath three meters of Arctic pack ice, a nuclear submarine acoustic officer intercepts a ghost vessel transmitting top-secret diplomatic codes from an abandoned 1984 bunker.',
    posterUrl: '/src/assets/images/poster_silent_meridian_1795491661563.jpg',
    bannerUrl: '/src/assets/images/poster_silent_meridian_1795491661563.jpg',
    trailerUrl: 'https://www.youtube.com/embed/LdOM0x0XDMo',
    cast: ['Cmdr. Vance — Cillian Murphy', 'Dr. Lindqvist — Florence Pugh', 'Admiral Vance — Stellan Skarsgard'],
    crew: ['Director: Christopher Nolan', 'Score: Hans Zimmer', 'Cinematography: Hoyte van Hoytema'],
    formats: ['IMAX 2D', 'Dolby Atmos', '2D'],
    status: 'coming_soon',
    trending: true,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_karavali_storm',
    title: 'Karavali: The Coastal Storm',
    genre: 'Action / Drama',
    duration: '2h 26m',
    rating: 9.2,
    language: 'Kannada',
    releaseDate: '2026-11-14',
    certificate: 'UA',
    description:
      'Along the windswept fishing harbours of coastal Karnataka, a fearless boatman confronts an illicit port syndicate during the fierce Karavali monsoon to protect his ancestral village.',
    posterUrl: '/src/assets/images/poster_karavali_storm_1795494333876.jpg',
    bannerUrl: '/src/assets/images/poster_karavali_storm_1795494333876.jpg',
    trailerUrl: 'https://www.youtube.com/embed/8mrVmf239GU',
    cast: ['Shiva — Rishab Shetty', 'Revathi — Sapthami Gowda', 'Devanna — Kishore Kumar'],
    crew: ['Director: Hemanth M. Rao', 'Music: B. Ajaneesh Loknath', 'Cinematography: Arvind Kashyap'],
    formats: ['IMAX 2D', 'Dolby Atmos', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: true,
    featured: false,
  },
  {
    movie_id: 'mov_bengaluru_midnight',
    title: 'Bengaluru Midnight',
    genre: 'Mystery / Thriller',
    duration: '2h 08m',
    rating: 8.8,
    language: 'Kannada',
    releaseDate: '2026-11-20',
    certificate: 'UA',
    description:
      'During a rain-swept blackout across Indiranagar and MG Road, an investigative radio host follows five encrypted voice notes left inside a vintage car to uncover a decade-old disappearance.',
    posterUrl: '/src/assets/images/poster_bengaluru_noir_1795494334522.jpg',
    bannerUrl: '/src/assets/images/poster_bengaluru_noir_1795494334522.jpg',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    cast: ['Vikram — Rakshit Shetty', 'Ananya — Rukmini Vasanth', 'ACP Raghu — Achyuth Kumar'],
    crew: ['Director: Pawan Kumar', 'Music: Charan Raj', 'Cinematography: Advaitha Gurumurthy'],
    formats: ['Dolby Atmos', '2D'],
    status: 'now_showing',
    trending: true,
    recommended: true,
    featured: false,
  },
];

export const SEED_THEATRES: Theatre[] = [
  {
    theatre_id: 'tht_blr_orion',
    name: 'CineVault IMAX Orion Mall',
    city: 'Bengaluru',
    address: 'Dr Rajkumar Rd, Malleswaram West, Bengaluru 560055',
    screens: 11,
    amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliner Lounge', 'Valet Parking'],
  },
  {
    theatre_id: 'tht_blr_indiranagar',
    name: 'CineVault Luxe Indiranagar',
    city: 'Bengaluru',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    screens: 6,
    amenities: ['Dolby Atmos', '4DX', 'Gourmet F&B'],
  },
  {
    theatre_id: 'tht_mum_phoenix',
    name: 'CineVault Grand Palladium',
    city: 'Mumbai',
    address: 'High Street Phoenix, Lower Parel, Mumbai 400013',
    screens: 9,
    amenities: ['IMAX Laser', 'Dolby Atmos', 'VIP Director Cut'],
  },
  {
    theatre_id: 'tht_mum_bandra',
    name: 'CineVault Maison Bandra',
    city: 'Mumbai',
    address: 'Linking Road, Bandra West, Mumbai 400050',
    screens: 5,
    amenities: ['Dolby Atmos', 'Boutique Seating', 'Artisan Cafe'],
  },
  {
    theatre_id: 'tht_del_saket',
    name: 'CineVault Select Citywalk',
    city: 'Delhi NCR',
    address: 'A-3 District Centre, Saket, New Delhi 110017',
    screens: 8,
    amenities: ['IMAX 2D', '4DX', 'Dolby Atmos'],
  },
  {
    theatre_id: 'tht_del_cyberhub',
    name: 'CineVault Ambience CyberHub',
    city: 'Delhi NCR',
    address: 'DLF Cyber City, Phase II, Gurugram 122002',
    screens: 7,
    amenities: ['Dolby Atmos', 'Recliner Lounge', 'Valet Parking'],
  },
  {
    theatre_id: 'tht_hyd_jubilee',
    name: 'CineVault AMB Jubilee',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Kondapur, Hyderabad 500084',
    screens: 8,
    amenities: ['Laser Projection', 'Dolby Atmos', 'Recliner Lounge'],
  },
  {
    theatre_id: 'tht_hyd_banjara',
    name: 'CineVault Nexus Banjara',
    city: 'Hyderabad',
    address: 'Road No. 12, Banjara Hills, Hyderabad 500034',
    screens: 6,
    amenities: ['IMAX 2D', 'Gourmet F&B'],
  },
  {
    theatre_id: 'tht_chn_anna',
    name: 'CineVault Palazzo Vadapalani',
    city: 'Chennai',
    address: '183 Arcot Road, Vadapalani, Chennai 600026',
    screens: 9,
    amenities: ['IMAX Laser', 'Dolby Atmos', '4DX'],
  },
  {
    theatre_id: 'tht_chn_adyar',
    name: 'CineVault Luxe Velachery',
    city: 'Chennai',
    address: '142 Velachery Main Road, Chennai 600042',
    screens: 7,
    amenities: ['Dolby Atmos', 'Recliner Lounge'],
  },
];

export function generateSeedShows(): Show[] {
  const dates = getUpcomingDates(4);
  const nowShowing = SEED_MOVIES.filter((m) => m.status === 'now_showing');
  const shows: Show[] = [];

  const timeSlots = [
    { time: '10:15 AM', formatIdx: 0, silver: 150, gold: 200, premium: 300 },
    { time: '01:30 PM', formatIdx: 1, silver: 160, gold: 220, premium: 340 },
    { time: '04:45 PM', formatIdx: 0, silver: 180, gold: 240, premium: 360 },
    { time: '07:30 PM', formatIdx: 0, silver: 200, gold: 280, premium: 420 },
    { time: '10:15 PM', formatIdx: 1, silver: 170, gold: 230, premium: 350 },
  ];

  let idx = 1;
  for (const theatre of SEED_THEATRES) {
    for (let dIdx = 0; dIdx < dates.length; dIdx += 1) {
      const dateIso = dates[dIdx].iso;
      // Schedule 5 distinct now-showing movies per theatre per day so all languages (including Kannada) are represented
      for (let mOffset = 0; mOffset < 5; mOffset += 1) {
        const movie = nowShowing[(SEED_THEATRES.indexOf(theatre) * 2 + mOffset + dIdx) % nowShowing.length];
        const slotsForMovie = mOffset === 0 ? [timeSlots[0], timeSlots[2], timeSlots[3]] : [timeSlots[mOffset % timeSlots.length], timeSlots[(mOffset + 2) % timeSlots.length]];
        for (const slot of slotsForMovie) {
          const format = movie.formats[slot.formatIdx % movie.formats.length] || '2D';
          shows.push({
            show_id: `shw_${theatre.theatre_id.replace('tht_', '')}_${movie.movie_id.replace('mov_', '')}_${dIdx}_${idx}`,
            movie_id: movie.movie_id,
            theatre_id: theatre.theatre_id,
            city: theatre.city,
            screenName: `Audi ${((idx - 1) % theatre.screens) + 1}`,
            showDate: dateIso,
            showTime: slot.time,
            format,
            silverPrice: slot.silver,
            goldPrice: slot.gold,
            premiumPrice: slot.premium,
          });
          idx += 1;
        }
      }
    }
  }
  return shows;
}

export function generateInitialSeatLocks(shows: Show[]): Record<string, Record<string, ShowSeatLock>> {
  const map: Record<string, Record<string, ShowSeatLock>> = {};
  const presetOccupied = ['B4', 'B5', 'D5', 'D6', 'E4', 'E5', 'E6', 'F7', 'H5', 'H6'];
  shows.forEach((show, sIdx) => {
    const showLocks: Record<string, ShowSeatLock> = {};
    const subset = presetOccupied.filter((_, i) => (i + sIdx) % 2 === 0);
    for (const seatId of subset) {
      const row = seatId.charAt(0);
      const category = row <= 'C' ? 'silver' : row <= 'G' ? 'gold' : 'premium';
      const price = category === 'silver' ? show.silverPrice : category === 'gold' ? show.goldPrice : show.premiumPrice;
      showLocks[seatId] = {
        seat_id: seatId,
        show_id: show.show_id,
        booking_id: `seed_bkg_${show.show_id}`,
        user_id: 'seed_system',
        category,
        price,
        status: 'booked',
      };
    }
    map[show.show_id] = showLocks;
  });
  return map;
}
