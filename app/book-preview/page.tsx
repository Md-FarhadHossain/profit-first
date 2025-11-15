// app/book-preview/page.tsx
import PageSwiper from '@/components/PageSwiper'
import page1 from "@/public/bookCover.png"


const bookPages = [
  { id: 0, type: 'image' as const, src: {page1}, alt: 'Page 1' },
  { id: 1, type: 'image' as const, src: {page1}, alt: 'Page 2' },
  { id: 2, type: 'image' as const, src: {page1}, alt: 'Page 3' },
  { id: 3, type: 'image' as const, src: {page1}, alt: 'Page 4' },
  { id: 4, type: 'image' as const, src: {page1}, alt: 'Page 5' },
  // Add up to 10-15 pages
]

export default function BookPreview() {
  return <PageSwiper pages={bookPages} />
}