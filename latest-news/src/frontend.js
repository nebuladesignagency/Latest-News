import apiFetch from '@wordpress/api-fetch';

document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.latest-news-block');

  blocks.forEach((block) => {
    const attributes = JSON.parse(block.getAttribute('data-attributes') || '{}');

    if (!attributes?.postsToShow) {
      block.innerHTML = 'Missing block configuration.';
      return;
    }

    apiFetch({
      path: `/wp/v2/posts?per_page=${attributes.postsToShow}&_embed`,
    })
      .then((posts) => {
        let output = `<div class="latest-news-grid grid columns-${attributes.columns}">`;

        posts.forEach((post) => {
          const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
          const alt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '';
          const author = post._embedded?.author?.[0]?.name || '';
          const categories = post._embedded?.['wp:term']?.find(t => t?.[0]?.taxonomy === 'category') || [];
          const firstCategory = categories.length > 0 ? categories[0] : null;

          output += `<a key="${post.id}" class="card" href="${post.link}">`;

          if (attributes.showThumbnails && media) {
            output += `<div class="card-thumbnail">`;
            
            if (firstCategory) {
              output += `<div class="card-category">${firstCategory.name}</div>`;
            }
            
            output += `<img src="${media}" alt="${alt}" class="attachment-medium size-medium wp-post-image" />`;
            output += `</div>`; // close card-thumbnail
          }

          output += `<div class="card-meta">`;
          output += `<h2 class="card-title">${post.title.rendered}</h2>`;

          if (attributes.showDate) {
            const dateDisplay = new Date(post.date).toLocaleDateString();
            output += `<div class="card-date">
              <span class="datetime">${dateDisplay}</span>
            </div>`;
          }

          if (attributes.showExcerpt) {
            const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '');
            output += `<div class="card-excerpt">${cleanExcerpt}</div>`;
          }

          output += `<div class="button has-primary-background-color">
            <span>Read More</span>
          </div>`;
          output += `</div></a>`; // close card-meta and a tag
        });

        output += `</div>`;
        block.innerHTML = output;
      })
      .catch((error) => {
        block.innerHTML = `Error loading posts: ${error.message}`;
      });
  });
});