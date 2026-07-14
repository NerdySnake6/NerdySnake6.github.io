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
  socialPreviews: Object.freeze({
    default: new URL('/assets/og/portfolio-preview-default.png', siteOrigin).href,
    ru: new URL('/assets/og/portfolio-preview-ru.png', siteOrigin).href,
    en: new URL('/assets/og/portfolio-preview-en.png', siteOrigin).href
  }),
  sitemap: new URL('/sitemap.xml', siteOrigin).href
});

export const githubProfileUrl = 'https://github.com/NerdySnake6';
