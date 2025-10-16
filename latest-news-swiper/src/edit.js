import { useBlockProps, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import {
  PanelBody,
  RangeControl,
  ToggleControl,
  SelectControl,
  Spinner,
  TextControl,
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { renderPosts } from './renderPosts';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-flip';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-creative';
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
  EffectCreative,
  Keyboard,
  Parallax,
} from 'swiper/modules';

// Helper to generate a unique ID for each block instance
function useUniqueId(prefix = 'latest-news-swiper-') {
  const idRef = useRef();
  if (!idRef.current) {
    idRef.current = prefix + Math.random().toString(36).substr(2, 9);
  }
  return idRef.current;
}

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();
  const [posts, setPosts] = useState(null);
  const [postTypes, setPostTypes] = useState([]);
  const [taxonomies, setTaxonomies] = useState([]);
  const [authors, setAuthors] = useState([]);
  const uniqueId = useUniqueId();

  useEffect(() => {
    // Build query parameters
    let queryParams = `per_page=${attributes.postsToShow}&_embed`;
    
    // Add ordering
    if (attributes.orderBy === 'date_desc') {
      queryParams += '&orderby=date&order=desc';
    } else if (attributes.orderBy === 'date_asc') {
      queryParams += '&orderby=date&order=asc';
    }
    
    // Add category filter
    if (attributes.selectedCategories && attributes.selectedCategories.length > 0) {
      queryParams += `&categories=${attributes.selectedCategories.join(',')}`;
    }
    
    // Add author filter
    if (attributes.selectedAuthor) {
      queryParams += `&author=${attributes.selectedAuthor}`;
    }
    
    // Add sticky posts if enabled
    if (attributes.featuredSticky) {
      queryParams += '&sticky=true';
    }

    // Use the selected post type endpoint
    const postType = attributes.postType || 'post';
    const endpoint = postType === 'post' ? 'posts' : postType;

    apiFetch({
      path: `/wp/v2/${endpoint}?${queryParams}`,
    })
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [attributes.postsToShow, attributes.orderBy, attributes.selectedCategories, attributes.selectedAuthor, attributes.featuredSticky, attributes.postType]);

  // Fetch post types
  useEffect(() => {
    apiFetch({
      path: '/wp/v2/types',
    })
      .then((types) => {
        const publicTypes = Object.values(types).filter(type => type.viewable);
        setPostTypes(publicTypes);
      })
      .catch(() => setPostTypes([]));
  }, []);

  // Fetch taxonomies based on selected post type
  useEffect(() => {
    if (attributes.postType) {
      apiFetch({
        path: `/wp/v2/taxonomies?type=${attributes.postType}`,
      })
        .then((taxonomyData) => {
          const taxonomyPromises = Object.keys(taxonomyData).map(taxonomySlug => 
            apiFetch({
              path: `/wp/v2/${taxonomySlug}?per_page=100`,
            }).then(terms => ({
              taxonomy: taxonomySlug,
              label: taxonomyData[taxonomySlug].name,
              terms: terms
            })).catch(() => null)
          );
          
          Promise.all(taxonomyPromises).then(results => {
            setTaxonomies(results.filter(Boolean));
          });
        })
        .catch(() => setTaxonomies([]));
    }
  }, [attributes.postType]);

  // Fetch authors for dropdown
  useEffect(() => {
    apiFetch({
      path: '/wp/v2/users?per_page=100&who=authors',
    })
      .then(setAuthors)
      .catch(() => setAuthors([]));
  }, []);

  const settingsPanel = (
    <>
      <InspectorControls>
        <PanelBody title="General Settings">
          <RangeControl
            label="Number of Posts"
            value={attributes.postsToShow}
            onChange={(value) => setAttributes({ postsToShow: value })}
            min={1}
            max={10}
          />
          <RangeControl
            label="Grid Columns"
            value={attributes.columns}
            onChange={(value) => setAttributes({ columns: value })}
            min={1}
            max={4}
          />
          <ToggleControl
            label="Show Author"
            checked={attributes.showAuthor}
            onChange={() =>
              setAttributes({ showAuthor: !attributes.showAuthor })
            }
          />
          <ToggleControl
            label="Show Excerpt"
            checked={attributes.showExcerpt}
            onChange={() =>
              setAttributes({ showExcerpt: !attributes.showExcerpt })
            }
          />
          <ToggleControl
            label="Show Date"
            checked={attributes.showDate}
            onChange={() =>
              setAttributes({ showDate: !attributes.showDate })
            }
          />
          <ToggleControl
            label="Show Thumbnails"
            checked={attributes.showThumbnails}
            onChange={() =>
              setAttributes({ showThumbnails: !attributes.showThumbnails })
            }
          />
          <ToggleControl
            label="Show 'Read More'"
            checked={attributes.readMore}
            onChange={() =>
              setAttributes({ readMore: !attributes.readMore })
            }
          />
          <ToggleControl
            label="Show Category"
            checked={attributes.showCategory}
            onChange={() =>
              setAttributes({ showCategory: !attributes.showCategory })
            }
          />
        </PanelBody>

        <PanelBody title="Sorting and Filtering" initialOpen={false}>
          <SelectControl
            label="Post Type"
            value={attributes.postType}
            options={[
              { label: 'Select Post Type', value: '' },
              ...postTypes.map(type => ({
                label: type.name,
                value: type.slug
              }))
            ]}
            onChange={(value) => setAttributes({ postType: value, selectedCategories: [] })}
          />
          <SelectControl
            label="Order By"
            value={attributes.orderBy}
            options={[
              { label: 'Newest to Oldest', value: 'date_desc' },
              { label: 'Oldest to Newest', value: 'date_asc' },
            ]}
            onChange={(value) => setAttributes({ orderBy: value })}
          />
          {taxonomies.length > 0 && (
            <SelectControl
              label="Filter by Categories/Terms"
              multiple
              value={attributes.selectedCategories}
              options={[
                { label: 'All Categories', value: '' },
                ...taxonomies.flatMap(taxonomy => 
                  taxonomy.terms.map(term => ({
                    label: `${taxonomy.label}: ${term.name}`,
                    value: term.id.toString()
                  }))
                )
              ]}
              onChange={(value) => setAttributes({ selectedCategories: Array.isArray(value) ? value : [value] })}
              help="Hold Ctrl/Cmd to select multiple categories"
            />
          )}
          <SelectControl
            label="Author"
            value={attributes.selectedAuthor}
            options={[
              { label: 'All', value: '' },
              ...authors.map(author => ({
                label: author.name,
                value: author.id.toString()
              }))
            ]}
            onChange={(value) => setAttributes({ selectedAuthor: value })}
          />
          <ToggleControl
            label="Featured Sticky Posts"
            checked={attributes.featuredSticky}
            onChange={() =>
              setAttributes({ featuredSticky: !attributes.featuredSticky })
            }
            help="Show sticky posts first with featured styling"
          />
        </PanelBody>

        <PanelBody title="Swiper Settings" initialOpen={false}>
          <ToggleControl
            label="Enable Swiper"
            checked={attributes.swiperEnabled}
            onChange={() =>
              setAttributes({ swiperEnabled: !attributes.swiperEnabled })
            }
          />
          {attributes.swiperEnabled && (
            <>
              <ToggleControl
                label="Autoplay"
                checked={attributes.swiperAutoplay}
                onChange={() =>
                  setAttributes({ swiperAutoplay: !attributes.swiperAutoplay })
                }
              />
              <ToggleControl
                label="Loop"
                checked={attributes.swiperLoop}
                onChange={() =>
                  setAttributes({ swiperLoop: !attributes.swiperLoop })
                }
              />
              <ToggleControl
                label="Centered Slides"
                checked={attributes.swiperCenteredSlides}
                onChange={() =>
                  setAttributes({
                    swiperCenteredSlides: !attributes.swiperCenteredSlides,
                  })
                }
              />
              <ToggleControl
                label="Keyboard Navigation"
                checked={attributes.swiperKeyboard}
                onChange={() =>
                  setAttributes({ swiperKeyboard: !attributes.swiperKeyboard })
                }
              />
              <ToggleControl
                label="Navigation Buttons"
                checked={attributes.swiperNavigation}
                onChange={() =>
                  setAttributes({
                    swiperNavigation: !attributes.swiperNavigation,
                  })
                }
              />
              <SelectControl
                label="Pagination Type"
                value={attributes.swiperPaginationType}
                options={[
                  { label: 'Bullets', value: 'bullets' },
                  { label: 'Fraction', value: 'fraction' },
                  { label: 'Progressbar', value: 'progressbar' },
                  { label: 'None', value: 'none' },
                ]}
                onChange={(value) =>
                  setAttributes({ swiperPaginationType: value })
                }
              />
              <SelectControl
                label="Transition Effect"
                value={attributes.swiperEffect}
                options={[
                  { label: 'Slide', value: 'slide' },
                  { label: 'Fade', value: 'fade' },
                  { label: 'Cube', value: 'cube' },
                  { label: 'Flip', value: 'flip' },
                  { label: 'Creative', value: 'creative' },
                  { label: 'Cards', value: 'cards' },
                ]}
                onChange={(value) =>
                  setAttributes({ swiperEffect: value })
                }
              />
              <RangeControl
                label="Slides in View"
                value={attributes.swiperSlidesPerView}
                onChange={(value) => setAttributes({ swiperSlidesPerView: value })}
                min={1}
                max={10}
              />
              <RangeControl
                label="Space Between Slides"
                value={attributes.swiperSpaceBetween}
                onChange={(value) => setAttributes({ swiperSpaceBetween: value })}
                min={0}
                max={100}
              />
              
              {attributes.swiperPaginationType !== 'none' && (
                <RangeControl
                  label="Pagination Offset"
                  value={attributes.paginationOffset}
                  onChange={(value) => setAttributes({ paginationOffset: value })}
                  min={-100}
                  max={100}
                  help="Vertical offset in pixels"
                />
              )}
              
              {attributes.swiperNavigation && (
                <RangeControl
                  label="Arrow Offset"
                  value={attributes.arrowOffset}
                  onChange={(value) => setAttributes({ arrowOffset: value })}
                  min={-100}
                  max={100}
                  help="Horizontal offset in pixels (applies to both arrows)"
                />
              )}
            </>
          )}
        </PanelBody>

        {attributes.swiperEnabled && (
          <PanelColorSettings
            title="Swiper Colors"
            initialOpen={false}
            colorSettings={[
              ...(attributes.swiperPaginationType !== 'none' ? [{
                value: attributes.paginationColor,
                onChange: (color) => setAttributes({ paginationColor: color }),
                label: 'Pagination Color',
              }] : []),
              ...(attributes.swiperNavigation ? [{
                value: attributes.arrowColor,
                onChange: (color) => setAttributes({ arrowColor: color }),
                label: 'Arrow Color',
              }] : []),
            ]}
          />
        )}
      </InspectorControls>
    </>
  );

  return (
    <div {...blockProps}>
      {settingsPanel}
      {!posts ? (
        <Spinner />
      ) : attributes.swiperEnabled ? (
        <div>
          <style>{`
            .wp-block-latest-news-block-latest-news .swiper-pagination .swiper-pagination-bullet {
              background-color: ${attributes.paginationColor || 'var(--wp--preset--color--primary, #f6be00)'} !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-pagination .swiper-pagination-bullet-active {
              background-color: ${attributes.paginationColor || 'var(--wp--preset--color--primary, #f6be00)'} !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-pagination .swiper-pagination-progressbar-fill {
              background-color: ${attributes.paginationColor || 'var(--wp--preset--color--primary, #f6be00)'} !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-pagination .swiper-pagination-fraction {
              color: ${attributes.paginationColor || 'var(--wp--preset--color--primary, #f6be00)'} !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-button-prev:after,
            .wp-block-latest-news-block-latest-news .swiper-button-next:after {
              color: ${attributes.arrowColor || 'var(--wp--preset--color--contrast, #000000)'} !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-pagination {
              margin-top: ${attributes.paginationOffset}px !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-button-prev-${uniqueId} {
              left: ${10 + attributes.arrowOffset}px !important;
            }
            .wp-block-latest-news-block-latest-news .swiper-button-next-${uniqueId} {
              right: ${10 + attributes.arrowOffset}px !important;
            }
          `}</style>
          <Swiper
            slidesPerView={attributes.swiperSlidesPerView || 1}
            loop={attributes.swiperLoop}
            autoplay={attributes.swiperAutoplay ? { delay: 3000 } : false}
            centeredSlides={attributes.swiperCenteredSlides}
            keyboard={attributes.swiperKeyboard}
            navigation={{
              nextEl: `.swiper-button-next-${uniqueId}`,
              prevEl: `.swiper-button-prev-${uniqueId}`,
            }}
            effect={attributes.swiperEffect}
            pagination={
              attributes.swiperPaginationType !== 'none'
                ? { type: attributes.swiperPaginationType }
                : false
            }
            spaceBetween={attributes.swiperSpaceBetween ?? 24}
            style={{ marginTop: 20, marginBottom: 20 }}
          >
          {posts.map((post, idx) => (
            <SwiperSlide key={post.id || idx}>
              {renderPosts([post], { ...attributes, isEditorPreview: true })}
            </SwiperSlide>
          ))}
            {/* Custom navigation buttons for this instance */}
            <div className={`swiper-button-prev swiper-button-prev-${uniqueId}`}></div>
            <div className={`swiper-button-next swiper-button-next-${uniqueId}`}></div>
          </Swiper>
        </div>
      ) : (
        renderPosts(posts, attributes)
      )}
    </div>
  );
}
