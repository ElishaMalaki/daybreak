export interface PublicSkyPhoto {
  url: string;
  alt: string;
}

export const publicDaySkyPhotos: PublicSkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9', alt: 'Golden sunset with bright clouds' },
  { url: 'https://images.unsplash.com/photo-1669988022776-d3349a323b4a', alt: 'Blue daytime sky with white clouds' },
  { url: 'https://images.unsplash.com/photo-1530178408322-35e0956c6944', alt: 'Pastel sunrise clouds' },
  { url: 'https://images.unsplash.com/photo-1638150927499-23c630720c5f', alt: 'Golden hour cloudscape' },
];

export const publicNightSkyPhotos: PublicSkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', alt: 'Milky Way night sky' },
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', alt: 'Clear starry night sky' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', alt: 'Deep night star field' },
];

export function isPublicSkyDaytime(hour: number) {
  return hour >= 6 && hour < 19;
}

export function getPublicSkyPhoto(hour: number, index: number) {
  const photos = isPublicSkyDaytime(hour) ? publicDaySkyPhotos : publicNightSkyPhotos;
  return photos[index % photos.length];
}
