/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'

type ProductImageSliderProps = {
  images?: string[] // hoặc `string[]` nếu bạn muốn bắt buộc phải có
}

const ProductImageSlider = ({ images = [] }: ProductImageSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle previous slide
  const handlePrev = () => {
    if (isTransitioning || images.length <= 1) return

    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))

    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Handle next slide
  const handleNext = () => {
    if (isTransitioning || images.length <= 1) return

    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))

    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (isTransitioning || index === activeIndex) return
    setIsTransitioning(true)
    setActiveIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Calculate visible thumbnails
  const thumbnailsToShow = Math.min(5, images.length)
  const visibleThumbnails = images.slice(0, thumbnailsToShow)

  // If there are no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className='flex flex-col space-y-4'>
        <div className='relative w-full bg-gray-100 pt-[100%] shadow'>
          <div className='absolute inset-0 flex items-center justify-center text-gray-400'>No image available</div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col space-y-4'>
      {/* Main image */}
      <div className='relative w-full overflow-hidden pt-[100%] shadow'>
        {images.map((image, index) => (
          <div
            key={`main-${index}`}
            className={`absolute top-0 left-0 h-full w-full transition-opacity duration-300 ease-in-out ${
              index === activeIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
          >
            <img src={image} alt={`Product image ${index + 1}`} className='h-full w-full bg-white object-cover' />
          </div>
        ))}

        {/* Zoom overlay on hover */}
        <div className='absolute inset-0 z-20 cursor-zoom-in bg-transparent hover:bg-black/5' />
      </div>

      {/* Thumbnails */}
      <div className='relative grid grid-cols-5 gap-2'>
        {/* Previous button */}
        {images.length > 5 && (
          <button
            onClick={handlePrev}
            className='absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white transition-colors hover:bg-black/40'
            aria-label='Previous image'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-5 w-5'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
            </svg>
          </button>
        )}

        {/* Thumbnail images */}
        {visibleThumbnails.map((img, index) => (
          <div
            className={`relative w-full cursor-pointer border-2 pt-[100%] ${
              activeIndex === index ? 'border-orange' : 'border-transparent'
            } transition-all duration-200 hover:opacity-90`}
            key={`thumb-${index}`}
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className='absolute top-0 left-0 h-full w-full bg-white object-cover'
            />
          </div>
        ))}

        {/* Next button */}
        {images.length > 5 && (
          <button
            onClick={handleNext}
            className='absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white transition-colors hover:bg-black/40'
            aria-label='Next image'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-5 w-5'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
            </svg>
          </button>
        )}
      </div>

      {/* Image counter indicator */}
      <div className='absolute bottom-14 right-2 z-30 rounded bg-black/50 px-2 py-1 text-xs text-white'>
        {activeIndex + 1}/{images.length}
      </div>
    </div>
  )
}

export default ProductImageSlider
