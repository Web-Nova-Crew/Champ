export interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: 'published' | 'draft'
  lastModified: string
}

export const mockPages: Page[] = [
  {
    id: '1',
    title: 'About Us',
    slug: 'about-us',
    content: '<p>About Estato...</p>',
    status: 'published',
    lastModified: '2024-01-20'
  },
  {
    id: '2',
    title: 'Terms of Service',
    slug: 'terms',
    content: '<p>Terms...</p>',
    status: 'published',
    lastModified: '2023-12-15'
  },
  {
    id: '3',
    title: 'Privacy Policy',
    slug: 'privacy',
    content: '<p>Privacy...</p>',
    status: 'published',
    lastModified: '2023-12-15'
  },
  {
    id: '4',
    title: 'Contact Us',
    slug: 'contact',
    content: '<p>Contact...</p>',
    status: 'published',
    lastModified: '2024-01-10'
  }
]
