export function renderPosts(posts, attributes) {
  return (
    <div className={`latest-news-grid grid columns-${attributes.columns}`}>
      {posts.map((post) => {
        const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        const alt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '';
        const author = post._embedded?.author?.[0]?.name || '';
        const categories = post._embedded?.['wp:term']
          ?.find((terms) => terms?.[0]?.taxonomy === 'category') || [];
        const firstCategory = categories.length > 0 ? [categories[0]] : [];

        return (
          <a key={post.id} className="card" href={post.link}>
            {attributes.showThumbnails && media && (
              <div className="card-thumbnail">
                {firstCategory.length > 0 && (
                  <div className="card-category">
                    {firstCategory.map((cat) => (
                      <span key={cat.id}>{cat.name}</span>
                    ))}
                  </div>
                )}
                <img
                  src={media}
                  alt={alt}
                  className="attachment-medium size-medium wp-post-image"
                />
              </div>
            )}

            <div className="card-meta">
              <h2 className="card-title">{post.title.rendered}</h2>
              
              {attributes.showDate && (
                <div className="card-date">
                  <span className="datetime">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {attributes.showExcerpt && (
                <div className="card-excerpt">
                  {post.excerpt.rendered.replace(/<[^>]+>/g, '')}
                </div>
              )}

              <div className="button has-primary-background-color">
                <span>Read More</span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}