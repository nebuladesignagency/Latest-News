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

          output += `<article class="card post-card">`;
          output += `<a key="${post.id}" class="" href="${post.link}">`;

          if (attributes.showThumbnails && media) {
            output += `<div class="card-thumbnail">
              <img src="${media}" alt="${alt}" class="attachment-medium size-medium wp-post-image" />`;

            if (attributes.showDate) {
              const dateISO = new Date(post.date).toISOString();
              const dateDisplay = new Date(post.date).toLocaleDateString();
              output += `<div class="card-date">
                <time class="datetime" datetime="${dateISO}" itemprop="datePublished">${dateDisplay}</time>
              </div>`;
            }

            if (categories.length > 0) {
              const firstCategory = categories[0];
              output += `<div class="card-category"><span key="${firstCategory.id}">${firstCategory.name}</span></div>`;
            }

            output += `</div>`; // close card-thumbnail
          }

          output += `<div class="card-meta">`;
          output += `<div>`;


            output += `<h3 class="card-title">${post.title.rendered}</h3>`;
            if (attributes.showAuthor && author) {
              output += `<div class="author">${author}</div>`;
            }

            if (attributes.showExcerpt) {
              const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '');
              output += `<div class="card-excerpt">${cleanExcerpt}</div>`;
            }
          output += `</div>`;

          output += `<div class="read-more"><span>Read More</span></div>`;
          output += `</div></a></article>`;
        });

        output += `</div>`;
        block.innerHTML = output;
      })
      .catch((error) => {
        block.innerHTML = `Error loading posts: ${error.message}`;
      });
  });
});