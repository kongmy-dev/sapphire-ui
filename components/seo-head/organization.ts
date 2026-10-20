export const defaultOrganization = {
  '@context': 'https://schema.org',
  '@type': ['ProfessionalService', 'Organization', 'LocalBusiness'],
  '@id': 'https://kongmy.dev/#organization',
  name: 'KONGMY Digital Solutions',
  description:
    'Independent technology consultant helping SMEs with serverless platforms, AI workflow automation, and custom software solutions.',
  url: 'https://kongmy.dev',
  logo: {
    '@type': 'ImageObject',
    url: 'https://kongmy.dev/android-chrome-512x512.webp',
    width: '512',
    height: '512',
  },
  image: 'https://kongmy.dev/Logo_Full.webp',
  email: 'hello@kongmy.dev',
  telephone: '+60174323118',
  priceRange: '$$',
  founder: {
    '@type': 'Person',
    '@id': 'https://kongmy.dev/#founder',
    name: 'Kong MY',
    jobTitle: 'Founder & Principal Consultant',
    url: 'https://kongmy.dev/#founder',
    sameAs: ['https://linkedin.com/in/kongmy', 'https://github.com/kuribu99'],
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kuala Lumpur',
    addressRegion: 'Kuala Lumpur',
    addressCountry: 'MY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 3.121625,
    longitude: 101.730683,
  },
  areaServed: [
    { '@type': 'Country', name: 'Malaysia' },
    { '@type': 'Place', name: 'Southeast Asia' },
  ],
  knowsAbout: [
    'IT Consulting',
    'Software Development',
    'AI & Workflow Automation',
    'Cloud Hosting & Infrastructure',
  ],
  sameAs: [
    'https://linkedin.com/in/kongmy',
    'https://github.com/kuribu99',
    'https://github.com/orgs/kongmy-dev',
  ],
};
