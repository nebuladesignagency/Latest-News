<?php
$attributes = $attributes ?? [];

// Set default values
$posts_to_show = $attributes['postsToShow'] ?? 3;
$columns = $attributes['columns'] ?? 3;
$show_author = $attributes['showAuthor'] ?? true;
$show_excerpt = $attributes['showExcerpt'] ?? true;
$show_date = $attributes['showDate'] ?? true;
$show_thumbnails = $attributes['showThumbnails'] ?? true;

// Fetch posts
$posts_query = new WP_Query([
    'post_type' => 'post',
    'posts_per_page' => $posts_to_show,
    'post_status' => 'publish'
]);

echo '<div ' . get_block_wrapper_attributes(['class' => 'latest-news-block']) . '>';

if ($posts_query->have_posts()) {
    echo '<div class="latest-news-grid grid columns-' . esc_attr($columns) . '">';
    
    while ($posts_query->have_posts()) {
        $posts_query->the_post();
        $post_id = get_the_ID();
        
        // Get featured image
        $featured_image = '';
        $alt_text = '';
        if ($show_thumbnails && has_post_thumbnail()) {
            $featured_image = get_the_post_thumbnail_url($post_id, 'medium');
            $alt_text = get_post_meta(get_post_thumbnail_id($post_id), '_wp_attachment_image_alt', true);
        }
        
        // Get author
        $author_name = get_the_author();
        
        // Get categories - limit to only the first one
        $categories = get_the_category();
        $first_category = !empty($categories) ? $categories[0] : null;
        
        echo '<a href="' . esc_url(get_permalink()) . '" class="card">';
        
        // Display thumbnail
        if ($show_thumbnails && $featured_image) {
            echo '<div class="card-thumbnail">';
            
            if ($first_category) {
                echo '<div class="card-category">';
                echo esc_html($first_category->name);
                echo '</div>';
            }
            
            echo '<img src="' . esc_url($featured_image) . '" alt="' . esc_attr($alt_text) . '" class="attachment-medium size-medium wp-post-image" />';
            echo '</div>';
        }
        
        echo '<div class="card-meta">';
        
        // Display title
        echo '<h2 class="card-title">' . esc_html(get_the_title()) . '</h2>';
        
        // Display date
        if ($show_date) {
            echo '<div class="card-date">';
            echo '<span class="datetime">' . esc_html(get_the_date()) . '</span>';
            echo '</div>';
        }
        
        // Display excerpt
        if ($show_excerpt) {
            echo '<div class="card-excerpt">' . esc_html(get_the_excerpt()) . '</div>';
        }
        
        // Display read more
        echo '<div class="button has-primary-background-color">';
        echo '<span>Read More</span>';
        echo '</div>';
        
        echo '</div>'; // close card-meta
        echo '</a>';
    }
    
    echo '</div>'; // close latest-news-grid
    wp_reset_postdata();
} else {
    echo '<p>No posts found.</p>';
}

echo '</div>'; // close latest-news-block