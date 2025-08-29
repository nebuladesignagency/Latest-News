export function renderPosts(posts, attributes) {
  return (
    <div className={`latest-news-grid grid columns-${attributes.columns}`}>
      {posts.map((post) => {
        const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        const alt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '';
        const author = post._embedded?.author?.[0]?.name || '';
        const categories = post._embedded?.['wp:term']
          ?.find((terms) => terms?.[0]?.taxonomy === 'category') || [];

        return (
          <article className="card post-card">
          <a key={post.id} className="" href={post.link}>
            {attributes.showThumbnails && media && (
              <div className="card-thumbnail">
                <img
                  src={media}
                  alt={alt}
                  className="attachment-medium size-medium wp-post-image"
                />

                {attributes.showDate && (
                  <div className="card-date">
                    <time
                      className="datetime"
                      dateTime={new Date(post.date).toISOString()}
                      itemProp="datePublished"
                    >
                      {new Date(post.date).toLocaleDateString()}
                    </time>
                  </div>
                )}
              {categories.length > 0 && (
                <div className="card-category">
                  <span key={categories[0].id}>{categories[0].name}</span>
                </div>
              )}
              </div>
            )}

            <div className="card-meta">
             <div>              
              <h3 className="card-title">{post.title.rendered}</h3>
                {attributes.showAuthor && author && (
                  <div className="author">{author}</div>
                )}

              {attributes.showExcerpt && (
                <div className="card-excerpt">
                  {post.excerpt.rendered.replace(/<[^>]+>/g, '')}
                </div>
              )}
              </div>

              <div className="read-more"><span>Read More</span></div>
            </div>
            </a>
          </article>
        );
      })}
    </div>
  );
}