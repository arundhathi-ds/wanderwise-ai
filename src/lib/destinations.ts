export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  image: string;
  categories: string[];
  bestTime: string;
  overview: string;
  history: string;
  attractions: { name: string; description: string }[];
  food: string[];
  tips: string[];
  safety: string;
  nearby: string[];
  currency: string;
  language: string;
  phrases: { phrase: string; meaning: string }[];
  emergency: string;
  budgetTips: string[];
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1200&q=70`;

export const DESTINATIONS: Destination[] = [
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    tagline: "Temples, tea houses and timeless gardens.",
    image: img("photo-1493976040374-85c8e12f0c0e"),
    categories: ["Culture", "Nature", "Food"],
    bestTime: "March–May (cherry blossoms) and October–November (autumn colors).",
    overview:
      "Kyoto was Japan's imperial capital for over a thousand years. Today it is a city of wooden machiya houses, moss gardens, and more than 1,600 Buddhist temples.",
    history:
      "Founded in 794 as Heian-kyō, Kyoto remained the seat of the emperor until 1868. It was famously spared from WWII bombing, preserving much of its historic architecture.",
    attractions: [
      { name: "Fushimi Inari Shrine", description: "Thousands of vermilion torii gates winding up a forested mountain." },
      { name: "Kinkaku-ji", description: "The Golden Pavilion, a Zen temple covered in gold leaf." },
      { name: "Arashiyama Bamboo Grove", description: "A luminous bamboo forest just west of the city." },
      { name: "Gion District", description: "Historic geisha quarter with lantern-lit alleys." },
    ],
    food: ["Kaiseki multi-course meals", "Matcha sweets", "Yudofu (hot tofu)", "Nishiki Market street food"],
    tips: [
      "Buy a city bus pass — Kyoto's best sights are spread out.",
      "Visit temples at sunrise to beat the crowds.",
      "Carry cash; many small restaurants don't accept cards.",
    ],
    safety: "Extremely safe. Standard urban precautions are sufficient.",
    nearby: ["Osaka", "Nara", "Lake Biwa"],
    currency: "Japanese Yen (JPY)",
    language: "Japanese",
    phrases: [
      { phrase: "Konnichiwa", meaning: "Hello" },
      { phrase: "Arigatō", meaning: "Thank you" },
      { phrase: "Sumimasen", meaning: "Excuse me" },
    ],
    emergency: "Police 110 · Ambulance/Fire 119",
    budgetTips: ["Eat at conveyor-belt sushi", "Stay in a guesthouse (ryokan-style)", "Use 7-Eleven ATMs for fee-free yen"],
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    tagline: "Souks, riads and the rose-colored medina.",
    image: img("photo-1539020140153-e479b8c22e70"),
    categories: ["Culture", "Shopping", "Food"],
    bestTime: "March–May and September–November when temperatures are mild.",
    overview:
      "Marrakech is a former imperial city where the snow-capped Atlas mountains meet the Sahara. Its old medina, framed by ochre walls, is a UNESCO World Heritage site.",
    history:
      "Founded by the Almoravid dynasty in 1062, Marrakech became a major political, economic and cultural center in North Africa and lent its name to the country itself.",
    attractions: [
      { name: "Jemaa el-Fnaa", description: "The main square turning into an open-air theatre each night." },
      { name: "Bahia Palace", description: "A 19th-century palace of carved cedar and zellige tiles." },
      { name: "Majorelle Garden", description: "Cobalt-blue garden once owned by Yves Saint Laurent." },
      { name: "Koutoubia Mosque", description: "12th-century minaret that defines the skyline." },
    ],
    food: ["Tagine", "Couscous Friday", "Mint tea", "Pastilla", "Harira soup"],
    tips: [
      "Agree on prices before riding a calèche or taking a guide.",
      "Dress modestly when visiting religious sites.",
      "Get lost in the souks on purpose — but pin your riad's location.",
    ],
    safety: "Generally safe; watch for pickpockets in the medina and be assertive with persistent touts.",
    nearby: ["Atlas Mountains", "Essaouira", "Ait Ben Haddou"],
    currency: "Moroccan Dirham (MAD)",
    language: "Arabic, Berber, French",
    phrases: [
      { phrase: "Salam", meaning: "Hello / Peace" },
      { phrase: "Shukran", meaning: "Thank you" },
      { phrase: "La, shukran", meaning: "No, thank you" },
    ],
    emergency: "Police 19 · Ambulance 15",
    budgetTips: ["Eat at the food stalls in Jemaa el-Fnaa", "Stay in a small family riad", "Take shared grand taxis between cities"],
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    tagline: "Seven hills, yellow trams and pastel sunsets.",
    image: img("photo-1513735492246-483525079686"),
    categories: ["Culture", "Food", "Family"],
    bestTime: "April–June and September–October.",
    overview:
      "Lisbon is Europe's sunniest capital, a city of tiled facades, rattling trams and viewpoints over the river Tagus.",
    history:
      "Lisbon is one of the oldest cities in Western Europe, predating other capitals like London and Paris by centuries. The 1755 earthquake reshaped its downtown into the elegant Pombaline grid.",
    attractions: [
      { name: "Belém Tower", description: "Manueline tower from Portugal's Age of Discovery." },
      { name: "Alfama", description: "Oldest neighborhood, birthplace of fado music." },
      { name: "Tram 28", description: "Iconic yellow tram looping the historic hills." },
      { name: "LX Factory", description: "Industrial complex turned creative hub." },
    ],
    food: ["Pastel de nata", "Bacalhau à brás", "Bifana sandwich", "Ginjinha cherry liqueur"],
    tips: [
      "Wear shoes with grip — the calçada cobbles get slippery.",
      "Buy a 24h transit pass for trams, metro and elevators.",
      "Eat dinner late, like the locals (after 8pm).",
    ],
    safety: "Very safe; pickpockets work the trams and Bairro Alto at night.",
    nearby: ["Sintra", "Cascais", "Setúbal"],
    currency: "Euro (EUR)",
    language: "Portuguese",
    phrases: [
      { phrase: "Olá", meaning: "Hello" },
      { phrase: "Obrigado / Obrigada", meaning: "Thank you (m/f)" },
      { phrase: "Por favor", meaning: "Please" },
    ],
    emergency: "All emergencies 112",
    budgetTips: ["Take public ferries for river views", "Visit museums on the first Sunday of the month", "Lunch menus (menu do dia) are great value"],
  },
  {
    id: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    region: "Oceania",
    tagline: "Alpine lakes and adrenaline at the edge of the world.",
    image: img("photo-1469854523086-cc02fe5d8800"),
    categories: ["Adventure", "Nature"],
    bestTime: "December–February for hiking, June–August for skiing.",
    overview:
      "Queenstown sits on the shores of Lake Wakatipu, framed by the jagged Remarkables. It's the adventure capital of New Zealand.",
    history:
      "Originally a Maori summer camp, the town boomed during the 1860s gold rush and reinvented itself as a year-round adventure resort.",
    attractions: [
      { name: "Skyline Gondola", description: "Panoramic ride above the lake to Bob's Peak." },
      { name: "Milford Sound", description: "Fjord day-trip through cinematic rainforest." },
      { name: "Shotover Jet", description: "High-speed boat through narrow canyons." },
      { name: "Arrowtown", description: "Restored gold-rush village nearby." },
    ],
    food: ["Fergburger", "Lamb shank", "Central Otago pinot noir", "Hokey pokey ice cream"],
    tips: [
      "Book bungee and skydive slots in advance during peak season.",
      "Layer up — alpine weather changes fast.",
      "Rent a car to reach Glenorchy and Wanaka.",
    ],
    safety: "Very safe. Respect alpine conditions and check DOC trail status before hikes.",
    nearby: ["Wanaka", "Glenorchy", "Te Anau"],
    currency: "New Zealand Dollar (NZD)",
    language: "English, Te Reo Māori",
    phrases: [
      { phrase: "Kia ora", meaning: "Hello / Be well" },
      { phrase: "Ka pai", meaning: "Good / Well done" },
    ],
    emergency: "All emergencies 111",
    budgetTips: ["Cook at your hostel — restaurants are pricey", "Free hikes: Queenstown Hill, Tiki Trail", "Drive to Wanaka instead of flying"],
  },
  {
    id: "oaxaca",
    name: "Oaxaca",
    country: "Mexico",
    region: "Americas",
    tagline: "Mezcal, mole and a living indigenous culture.",
    image: img("photo-1518105779142-d975f22f1b0a"),
    categories: ["Food", "Culture"],
    bestTime: "October–April; visit late October for Day of the Dead.",
    overview:
      "Oaxaca is a high-altitude city of pastel facades, indigenous markets and one of Mexico's most celebrated food scenes.",
    history:
      "Surrounded by Zapotec and Mixtec ruins, Oaxaca was founded by the Spanish in 1532 over an earlier indigenous settlement and has remained a stronghold of pre-Hispanic culture.",
    attractions: [
      { name: "Monte Albán", description: "Hilltop Zapotec ruins overlooking three valleys." },
      { name: "Mercado 20 de Noviembre", description: "Smoky carnivore's market of grilled meats." },
      { name: "Hierve el Agua", description: "Petrified mineral waterfalls and infinity pools." },
      { name: "Templo de Santo Domingo", description: "Baroque church and botanical garden." },
    ],
    food: ["Seven moles", "Tlayudas", "Mezcal", "Chapulines (grasshoppers)", "Tejate"],
    tips: [
      "Try mezcal flights at a small palenque outside the city.",
      "Take a Spanish/cooking class — Oaxaca is famous for both.",
      "Carry small bills for markets.",
    ],
    safety: "Generally safe in the city center. Avoid driving rural roads at night.",
    nearby: ["Mitla", "Teotitlán del Valle", "Puerto Escondido"],
    currency: "Mexican Peso (MXN)",
    language: "Spanish, Zapotec",
    phrases: [
      { phrase: "Hola", meaning: "Hello" },
      { phrase: "Gracias", meaning: "Thank you" },
      { phrase: "¿Cuánto cuesta?", meaning: "How much?" },
    ],
    emergency: "All emergencies 911",
    budgetTips: ["Eat comida corrida lunch menus", "Share collectivo vans to the valleys", "Free music in the zócalo most evenings"],
  },
  {
    id: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    region: "Europe",
    tagline: "Hot springs, lava fields and the northern lights.",
    image: img("photo-1504829857797-ddff29c27927"),
    categories: ["Nature", "Adventure"],
    bestTime: "June–August for daylight, September–March for aurora.",
    overview:
      "Reykjavík is the world's northernmost capital — a small, colorful city that serves as the base camp for Iceland's volcanic landscapes.",
    history:
      "Settled by Norse Vikings in 874 AD and named for the steam ('reykr') from its geothermal springs, Reykjavík remained a tiny village until the 20th century.",
    attractions: [
      { name: "Hallgrímskirkja", description: "Concrete church inspired by basalt columns." },
      { name: "Blue Lagoon", description: "Milky geothermal spa near the airport." },
      { name: "Golden Circle", description: "Geysir, Gullfoss and Þingvellir in one day." },
      { name: "Sun Voyager", description: "Sculpture honoring undiscovered territory." },
    ],
    food: ["Lamb soup", "Skyr", "Hot dogs at Bæjarins Beztu", "Fresh-caught arctic char"],
    tips: [
      "Tap water is glacier-pure — skip bottled water.",
      "Rent a 4x4 if exploring beyond the Ring Road.",
      "Aurora forecasts at en.vedur.is.",
    ],
    safety: "Among the safest countries in the world. Weather is the main risk.",
    nearby: ["Vík", "Snæfellsnes Peninsula", "Akureyri"],
    currency: "Icelandic Króna (ISK)",
    language: "Icelandic",
    phrases: [
      { phrase: "Halló", meaning: "Hello" },
      { phrase: "Takk", meaning: "Thanks" },
    ],
    emergency: "All emergencies 112",
    budgetTips: ["Shop at Bónus supermarkets", "Bring a refillable water bottle", "Use city buses + free public pools"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    tagline: "Rice terraces, temples and surf breaks.",
    image: img("photo-1518548419970-58e3b4079ab2"),
    categories: ["Nature", "Adventure", "Family"],
    bestTime: "April–October (dry season).",
    overview:
      "Bali blends Hindu temples, emerald rice terraces and a relaxed island culture across a single small island.",
    history:
      "Bali has been a Hindu kingdom since the 9th century. Its unique traditions survived even as the rest of Indonesia became predominantly Muslim.",
    attractions: [
      { name: "Tegalalang Rice Terraces", description: "Sculpted hills near Ubud." },
      { name: "Uluwatu Temple", description: "Cliffside temple with sunset kecak dance." },
      { name: "Mount Batur", description: "Sunrise hike up an active volcano." },
      { name: "Sidemen Valley", description: "Quieter alternative to Ubud." },
    ],
    food: ["Babi guling", "Nasi campur", "Lawar", "Pisang goreng"],
    tips: [
      "Rent a scooter — but only if you have experience.",
      "Cover shoulders and wear a sarong at temples.",
      "Avoid tap water; brush teeth with bottled.",
    ],
    safety: "Mostly safe; watch traffic and ocean currents on south coast beaches.",
    nearby: ["Nusa Penida", "Lombok", "Gili Islands"],
    currency: "Indonesian Rupiah (IDR)",
    language: "Indonesian, Balinese",
    phrases: [
      { phrase: "Halo", meaning: "Hello" },
      { phrase: "Terima kasih", meaning: "Thank you" },
    ],
    emergency: "Police 110 · Ambulance 118",
    budgetTips: ["Eat at warungs (~$2 meals)", "Stay in homestays", "Use Gojek/Grab apps"],
  },
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    tagline: "A mountain in the sea, with vineyards on the side.",
    image: img("photo-1580060839134-75a5edca2e99"),
    categories: ["Nature", "Adventure", "Food"],
    bestTime: "October–April (Southern Hemisphere summer).",
    overview:
      "Cape Town wraps around Table Mountain and the Atlantic. It pairs world-class hikes and beaches with one of the planet's great wine regions.",
    history:
      "Founded by the Dutch East India Company in 1652 as a supply station, Cape Town carries layers of Dutch, British, Malay and Xhosa heritage — alongside the difficult history of apartheid.",
    attractions: [
      { name: "Table Mountain", description: "Cable car or hike up the city's iconic flat-top." },
      { name: "Cape Point", description: "Dramatic cliffs where the oceans meet." },
      { name: "Robben Island", description: "Where Nelson Mandela was imprisoned." },
      { name: "Constantia Wine Route", description: "Oldest wine region in the Southern Hemisphere." },
    ],
    food: ["Bobotie", "Cape Malay curry", "Braai (BBQ)", "Biltong", "Koeksisters"],
    tips: [
      "Don't hike Table Mountain alone or in cloud.",
      "Use Uber after dark instead of walking.",
      "Stop at Boulders Beach for the penguin colony.",
    ],
    safety: "Stick to well-trafficked areas, especially at night. Don't display valuables.",
    nearby: ["Stellenbosch", "Hermanus", "Garden Route"],
    currency: "South African Rand (ZAR)",
    language: "English, Afrikaans, Xhosa",
    phrases: [
      { phrase: "Howzit", meaning: "Hello / How's it going?" },
      { phrase: "Lekker", meaning: "Nice / Tasty" },
    ],
    emergency: "Police 10111 · Ambulance 10177",
    budgetTips: ["Stay in Sea Point", "Hike instead of cable car", "Free First Thursdays art walk"],
  },
];

export const CATEGORIES = ["Adventure", "Nature", "Culture", "Food", "Shopping", "Family"] as const;
export type Category = (typeof CATEGORIES)[number];

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
