export function renderPosts(posts, attributes) {
  // Support for editor preview: do not render Swiper markup if isEditorPreview is true
  const isEditorPreview = attributes.isEditorPreview;
  const isSwiper = attributes.swiperEnabled && !isEditorPreview;

  const wrapperClass = isSwiper
    ? 'swiper-wrapper swiper'
    : `latest-news-grid grid columns-${attributes.columns}`;

  const postItems = posts.map((post) => {
    const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const alt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '';
    const author = post._embedded?.author?.[0]?.name || '';
    const categories =
      post._embedded?.['wp:term']?.find((terms) => terms?.[0]?.taxonomy === 'category') || [];
    
    // Check if this is a sticky post and featured sticky is enabled
    const isSticky = post.sticky || false;
    const featuredClass = (attributes.featuredSticky && isSticky) ? ' featured' : '';

    return (
      <div className={isSwiper ? 'swiper-slide' : 'grid-item'} key={post.id}>
        <article className={`card post-card${featuredClass}`}>
          <a href={post.link} className="card">
            {attributes.showThumbnails && media && (
              <div className="card-thumbnail" style={{ backgroundImage: `url(${media})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}>
               
                {post.is_event && post.date_display && (
                  <div className="card-date">
                    <span className="datetime">{post.date_display}</span>
                  </div>
                )}
                
                
                {post.is_event && post.location && (
                  <div className="card-location">
                    
                    <span className="icon-close" style={{fontSize:16,marginRight:4}}>&#10006;</span>
                    {post.location}
                  </div>
                )}
              </div>
            )}

            <div className="card-meta">
              <div>
                <div className="category-reading-time">
                  {/* Category */}
                  {post.type === 'post' && categories.length > 0 && (
                    <div className="card-category">
                      {categories.map((cat) => (
                        <span key={cat.id}>{cat.name}</span>
                      ))}
                    </div>
                  )}
                  {/* Reading time */}
                  {post.content && post.content.rendered && (
                    <div className="card-reading-time">
                      {(() => {
                        const text = post.content.rendered.replace(/<[^>]+>/g, '');
                        const wordCount = text.trim().split(/\s+/).length;
                        const readingTime = Math.max(1, Math.round(wordCount / 250));
                        return `${readingTime} min read`;
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  {post.title && (
                    <h2 className="card-title">{post.title.rendered.replace(/<[^>]+>/g, '')}</h2>
                  )}
                  {post.excerpt && (
                    <p className="card-excerpt">{post.excerpt.rendered.replace(/<[^>]+>/g, '')}</p>
                  )}
                </div>
              </div>
              {(post.is_event || post.type === 'post') && (
                <div className="readmore">
                  <span>Learn More</span>
                </div>
              )}
            </div>
          </a>
        </article>
      </div>
    );
  });

  if (isEditorPreview) {
    // Only return the post items, no swiper/grid wrappers
    return postItems;
  }

  return isSwiper ? (
    <div className="swiper-container latest-news-swiper">
      <div className={wrapperClass}>{postItems}</div>

      {/* Optional Swiper controls */}
      {attributes.swiperPaginationType !== 'none' && (
        <div className={`swiper-pagination swiper-pagination-${attributes.swiperPaginationType}`}></div>
      )}
      {attributes.swiperNavigation && (
        <>
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
        </>
      )}
    </div>
  ) : (
    <div className={wrapperClass}>{postItems}</div>
  );
}
