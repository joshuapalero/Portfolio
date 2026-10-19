/**
 * Hashes a string into a deterministic positive integer.
 */
function getHashFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Curated life and technology photo seeds for instant zero-overhead access.
 * Matches monochrome aesthetic across laptops, books, study notes, coffee, hardware, and architecture.
 */
const LIFE_AND_TECH_PHOTO_IDS = [
  // Laptops and coding workstations (No people, clean lifestyle tech)
  'photo-1498050108023-c5249f4df085',
  'photo-1517694712202-14dd9538aa97',
  'photo-1461749280684-dccba630e2f6',
  'photo-1526374965328-7f61d4dc18c5',
  'photo-1555066931-4365d14bab8c',
  'photo-1587620962725-abab7fe55159',
  'photo-1542838132-92c53300491e',
  'photo-1515378791036-0648a3ef77b2',
  'photo-1488590528505-98d2b5aba04b',
  'photo-1525547719571-a2d4ac8945e2',
  
  // Books, specifications, libraries and reading
  'photo-1497633762265-9d179a990aa6',
  'photo-1524995997946-a1c2e315a42f',
  'photo-1512820790803-83ca734da794',
  'photo-1495446815901-a7297e633e8d',
  'photo-1507842229458-574a4fe4c9b3',
  'photo-1456513080510-7bf3a84b82f8',
  'photo-1532012164546-f432f2e3777f',
  'photo-1516979187457-637abb4f9353',
  'photo-1544716278-ca5e3f4abd8c',
  'photo-1519682337058-a94d519337bc',
  
  // Visual study, notebooks, flowcharts and architecture sketches
  'photo-1517842645767-c639042777db',
  'photo-1434030216411-0b793f4b4173',
  'photo-1455390582262-044cdead277a',
  'photo-1584697964190-71e9a99f18a4',
  'photo-1506784983877-45594efa4cbe',
  'photo-1484480974693-6ca0a78fb36b',
  'photo-1499750310107-5fef28a66643',
  'photo-1516321318423-f06f85e504b3',
  
  // Coffee, mugs and developer life routine
  'photo-1501339847302-ac426a4a7cbb',
  'photo-1495474472287-4d71bcdd2085',
  'photo-1514432324607-a09d9b4aefdd',
  'photo-1447933601403-0c6688de566e',
  'photo-1511920170033-f8396924c348',
  'photo-1509042239860-f550ce710b93',
  
  // Hardware, mechanical keyboards, headphones & tools
  'photo-1587829741301-dc798b83add3',
  'photo-1541807084-5c52b6b3adef',
  'photo-1505740420928-5e560c06d30e',
  'photo-1546868871-7041f2a55e12',
  'photo-1511707171634-5f897ff02aa9',
  'photo-1527864550417-7fd91fc51a46',
  
  // Modern workspace architecture & minimalist tech spaces
  'photo-1497366216548-37526070297c',
  'photo-1497366811353-6870744d04b2',
  'photo-1513694203232-719a280e022f',
  'photo-1486406146926-c627a92ad1ab',
  'photo-1507679799987-c73779587ccf',
  'photo-1497215728101-856f4ea42174',
];

/**
 * Returns a high-resolution, monochrome editorial developer workspace image
 * that matches the exact visual aesthetic of the blog posts.
 *
 * @param seed - Section slug, track title, or blog post topic.
 * @returns Path to the high-contrast editorial photography asset.
 */
export function getAutoImage(seed: string): string {
  const normalized = (seed || '').toLowerCase().trim();

  // 1. Node.js & Backend Runtime Architecture
  if (
    normalized.includes('node') ||
    normalized.includes('runtime') ||
    normalized.includes('backend') ||
    normalized.includes('server')
  ) {
    return '/resources/nodejs-runtime.jpg';
  }

  // 2. Deterministic Life & Technology photo selection for blog posts and new sections
  const hash = getHashFromString(normalized);
  const photoId = LIFE_AND_TECH_PHOTO_IDS[hash % LIFE_AND_TECH_PHOTO_IDS.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80&sat=-100`;
}

/**
 * Returns an image from the 1000 Life & Technology collection by index or seed.
 */
export function getLifeAndTechImage(indexOrSeed: number | string): string {
  const index = typeof indexOrSeed === 'number' ? Math.abs(indexOrSeed) : getHashFromString(indexOrSeed);
  const photoId = LIFE_AND_TECH_PHOTO_IDS[index % LIFE_AND_TECH_PHOTO_IDS.length];
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80&sat=-100`;
}
