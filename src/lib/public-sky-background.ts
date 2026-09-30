export interface PublicSkyPhoto {
  url: string;
  alt: string;
}

export const publicDaySkyPhotos: PublicSkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9', alt: 'Golden sunset clouds over the horizon' },
  { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', alt: 'Warm sunset sky with soft clouds' },
  { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e', alt: 'Sunset light across layered clouds' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', alt: 'Sunset clouds above open sky' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', alt: 'Golden clouds at sunset' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', alt: 'Sunset cloudscape with open sky' },
  { url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e', alt: 'Soft evening clouds with golden light' },
  { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b', alt: 'Clouds glowing during sunset' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429', alt: 'Warm sunset clouds across the sky' },
  { url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5', alt: 'Sunset sky with high clouds' },
  { url: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999', alt: 'Orange sunset behind clouds' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a26db0f4286f', alt: 'Golden hour clouds in daylight' },
  { url: 'https://images.unsplash.com/photo-1530178408322-35e0956c6944', alt: 'Pastel sunset clouds' },
  { url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda', alt: 'Bright sky with sunset cloud color' },
  { url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b', alt: 'Mountain sunset clouds' },
  { url: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8', alt: 'Cloudy sunset sky with warm light' },
  { url: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5', alt: 'Sunset clouds with soft blue sky' },
  { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', alt: 'Colorful sunset sky and clouds' },
  { url: 'https://images.unsplash.com/photo-1590523278191-995cbcda646b', alt: 'Sunset clouds above landscape' },
  { url: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2', alt: 'Warm cloudscape at sunset' },
  { url: 'https://images.unsplash.com/photo-1617142137869-325955e2d3be', alt: 'Clouds lit by sunset' },
  { url: 'https://images.unsplash.com/photo-1638150927499-23c630720c5f', alt: 'Golden hour cloudscape' },
  { url: 'https://images.unsplash.com/photo-1669988022776-d3349a323b4a', alt: 'Daytime clouds with warm sunlight' },
  { url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538', alt: 'Sunlit clouds at sunset' },
];

export const publicNightSkyPhotos: PublicSkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', alt: 'Milky Way night sky' },
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', alt: 'Clear starry night sky' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', alt: 'Deep night star field' },
  { url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3', alt: 'Starry night sky over the horizon' },
  { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', alt: 'Deep space night sky' },
  { url: 'https://images.unsplash.com/photo-1470290378698-263fa7ca60ab', alt: 'Night sky filled with stars' },
  { url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0', alt: 'Dark night sky and stars' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', alt: 'Night horizon under a calm sky' },
  { url: 'https://images.unsplash.com/photo-1515705576963-95cad62945b6', alt: 'Beautiful stars in a night sky' },
  { url: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a', alt: 'Star field in a dark night sky' },
  { url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47', alt: 'Milky Way and night sky' },
  { url: 'https://images.unsplash.com/photo-1532798369041-b33eb576ef16', alt: 'Night sky with bright stars' },
  { url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7', alt: 'Starry sky at night' },
  { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', alt: 'Beautiful night sky above clouds' },
  { url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938', alt: 'Dark blue night sky with stars' },
  { url: 'https://images.unsplash.com/photo-1593362831502-5c3ad1c05f57', alt: 'Night sky with visible stars' },
  { url: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6', alt: 'Starry night over a quiet horizon' },
  { url: 'https://images.unsplash.com/photo-1620121684840-edffcfc4b878', alt: 'Night sky with deep blue tones' },
];

export function isPublicSkyDaytime(hour: number) {
  return hour >= 6 && hour < 19;
}

export function getPublicSkyPhoto(hour: number, index: number) {
  const photos = isPublicSkyDaytime(hour) ? publicDaySkyPhotos : publicNightSkyPhotos;
  return photos[index % photos.length];
}
