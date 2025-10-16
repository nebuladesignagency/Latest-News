import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import './style.scss';


document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.latest-news-block.swiper-enabled');

  blocks.forEach((block) => {
    const data = block.getAttribute('data-attributes');
    if (!data) return;

    let attributes;
    try {
      attributes = JSON.parse(data);
    } catch (e) {
      console.error('Invalid JSON in data-attributes:', e);
      return;
    }

    const swiperContainer = block.querySelector('.swiper-container');
    if (!swiperContainer) return;

    const swiperOptions = {
      loop: !!attributes.swiperLoop,
      effect: attributes.swiperEffect || 'slide',
      centeredSlides: !!attributes.swiperCenteredSlides,
      keyboard: !!attributes.swiperKeyboard,
      slidesPerView: attributes.swiperSlidesPerView || 1,
      // slidesPerGroup now matches slidesPerView
      slidesPerGroup: attributes.swiperSlidesPerView || 1,
      spaceBetween: 20,
      breakpoints: {
        // Mobile
        320: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 10,
        },
        // Tablet
        768: {
          slidesPerView: Math.min(2, attributes.swiperSlidesPerView || 1),
          slidesPerGroup: Math.min(2, attributes.swiperSlidesPerView || 1),
          spaceBetween: 15,
        },
        // Desktop
        1200: {
          slidesPerView: attributes.swiperSlidesPerView || 1,
          slidesPerGroup: attributes.swiperSlidesPerView || 1,
          spaceBetween: 20,
        },
      },
    };

    if (attributes.swiperAutoplay) {
      swiperOptions.autoplay = {
        delay: 3000,
        disableOnInteraction: false,
      };
    }

    if (attributes.swiperPaginationType && attributes.swiperPaginationType !== 'none') {
      swiperOptions.pagination = {
        el: swiperContainer.querySelector('.swiper-pagination'),
        type: attributes.swiperPaginationType,
        clickable: true,
      };
    }

    if (attributes.swiperNavigation) {
      swiperOptions.navigation = {
        nextEl: swiperContainer.querySelector('.swiper-button-next'),
        prevEl: swiperContainer.querySelector('.swiper-button-prev'),
      };
    }

    // Apply custom styling
    const paginationElement = swiperContainer.querySelector('.swiper-pagination');
    if (paginationElement) {
      const style = document.createElement('style');
      const paginationColor = attributes.paginationColor || 'var(--wp--preset--color--primary, #f6be00)';
      style.textContent = `
        .latest-news-block .swiper-pagination .swiper-pagination-bullet {
          background-color: ${paginationColor} !important;
        }
        .latest-news-block .swiper-pagination .swiper-pagination-bullet-active {
          background-color: ${paginationColor} !important;
        }
        .latest-news-block .swiper-pagination .swiper-pagination-progressbar-fill {
          background-color: ${paginationColor} !important;
        }
        .latest-news-block .swiper-pagination .swiper-pagination-fraction {
          color: ${paginationColor} !important;
        }
      `;
      document.head.appendChild(style);

      // Apply pagination offset
      if (attributes.paginationOffset !== undefined) {
        paginationElement.style.marginTop = `${attributes.paginationOffset}px`;
      }
    }

    // Apply arrow styling
    const prevButton = swiperContainer.querySelector('.swiper-button-prev');
    const nextButton = swiperContainer.querySelector('.swiper-button-next');

    if (prevButton && nextButton) {
      const arrowStyle = document.createElement('style');
      const arrowColor = attributes.arrowColor || 'var(--wp--preset--color--contrast, #000000)';
      arrowStyle.textContent = `
        .latest-news-block .swiper-button-prev:after,
        .latest-news-block .swiper-button-next:after {
          color: ${arrowColor} !important;
        }
      `;
      document.head.appendChild(arrowStyle);
    }

    // Apply arrow offsets
    if (prevButton && attributes.arrowOffset !== undefined) {
      prevButton.style.left = `${10 + attributes.arrowOffset}px`;
    }
    if (nextButton && attributes.arrowOffset !== undefined) {
      nextButton.style.right = `${10 + attributes.arrowOffset}px`;
    }

    // Wait until enough slides are present before initializing Swiper
    const slides = swiperContainer.querySelectorAll('.swiper-slide');
    const minSlidesNeeded = Math.max(
      attributes.swiperSlidesPerView || 1,
      2 // Swiper needs at least 2 for loop mode
    );
    if (slides.length < minSlidesNeeded && swiperOptions.loop) {
      // Optionally, you could show a warning in the UI here
      console.warn('Not enough slides for Swiper loop mode. Swiper not initialized.');
      return;
    }
    new Swiper(swiperContainer, swiperOptions);
  });
});
