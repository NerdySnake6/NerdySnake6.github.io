export const siteOrigin = 'https://nerdysnake6.github.io';

export const pageRoutes = Object.freeze({
  root: '/',
  ru: '/ru/',
  en: '/en/'
});

export const pageUrls = Object.freeze(
  Object.fromEntries(
    Object.entries(pageRoutes).map(([key, route]) => [key, new URL(route, siteOrigin).href])
  )
);

export const seoAssets = Object.freeze({
  profileImage: new URL('/assets/photo-cropped-20260425.jpg', siteOrigin).href,
  socialPreview: new URL('/assets/og/portfolio-preview.png', siteOrigin).href,
  sitemap: new URL('/sitemap.xml', siteOrigin).href
});

export const githubProfileUrl = 'https://github.com/NerdySnake6';
