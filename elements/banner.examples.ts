import { BannerElement } from './banner.js';

function Announcement() {
  if (!BannerElement) throw new Error('Browser required');
  const banner = new BannerElement();
  banner.setAttribute('dismissible', '');
  banner.setAttribute('variant', 'info');
  banner.innerHTML = '<span>Scheduled maintenance begins at midnight.</span>';
  return banner;
}

function PersistentAnnouncement() {
  const banner = Announcement();
  banner.setAttribute('storage-key', 'element-example');
  banner.setAttribute('variant', 'success');
  return banner;
}

export const examples = [
  { name: 'announcement', render: Announcement },
  { name: 'persistent', render: PersistentAnnouncement },
] as const;
