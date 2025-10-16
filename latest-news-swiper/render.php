<?php
$attributes = $attributes ?? [];

$post_type      = $attributes['postType'] ?? 'post';
$taxonomy       = $attributes['taxonomy'] ?? '';
$term_id        = $attributes['termId'] ?? 0;
$posts_to_show  = $attributes['postsToShow'] ?? 3;
$columns        = $attributes['columns'] ?? 3;
$swiper_enabled = !empty($attributes['swiperEnabled']);
$order_by       = $attributes['orderBy'] ?? 'date_desc';
$selected_categories = $attributes['selectedCategories'] ?? [];
$selected_author = $attributes['selectedAuthor'] ?? '';
$featured_sticky = !empty($attributes['featuredSticky']);

$args = [
    'post_type'      => $post_type,
    'posts_per_page' => $posts_to_show,
    'post_status'    => 'publish',
];

// Handle ordering
if ($order_by === 'date_asc') {
    $args['orderby'] = 'date';
    $args['order'] = 'ASC';
} else {
    $args['orderby'] = 'date';
    $args['order'] = 'DESC';
}

// Handle taxonomy filtering (categories and other taxonomies)
if (!empty($selected_categories) && is_array($selected_categories)) {
    $term_ids = array_map('intval', array_filter($selected_categories));
    
    if (!empty($term_ids)) {
        // Get all taxonomies for the post type
        $taxonomies = get_object_taxonomies($post_type, 'objects');
        $tax_queries = [];
        
        foreach ($term_ids as $term_id) {
            $term = get_term($term_id);
            if ($term && !is_wp_error($term)) {
                $tax_queries[] = [
                    'taxonomy' => $term->taxonomy,
                    'field'    => 'term_id',
                    'terms'    => $term_id,
                ];
            }
        }
        
        if (!empty($tax_queries)) {
            if (count($tax_queries) > 1) {
                $args['tax_query'] = [
                    'relation' => 'OR',
                    ...$tax_queries
                ];
            } else {
                $args['tax_query'] = $tax_queries;
            }
        }
    }
}

// Handle author filtering
if (!empty($selected_author)) {
    $args['author'] = intval($selected_author);
}

// Handle sticky posts
if ($featured_sticky) {
    $sticky_posts = get_option('sticky_posts');
    if (!empty($sticky_posts)) {
        $args['post__in'] = $sticky_posts;
        $args['orderby'] = 'post__in';
    }
}

if ($taxonomy && $term_id) {
    $args['tax_query'] = [
        [
            'taxonomy' => $taxonomy,
            'field'    => 'term_id',
            'terms'    => $term_id,
        ],
    ];
}

$query = new WP_Query($args);

// Block wrapper with attributes for frontend.js
echo '<div class="latest-news-block' . ($swiper_enabled ? ' swiper-enabled' : '') . '" data-attributes="' . esc_attr(wp_json_encode($attributes)) . '" ' . get_block_wrapper_attributes() . '>';

if ($swiper_enabled) {
    echo '<div class="swiper-container latest-news-swiper">';
    echo '<div class="swiper-wrapper">';
} else {
    echo '<div class="latest-news-grid grid columns-' . esc_attr($columns) . '">';
}

if ($query->have_posts()) {
    while ($query->have_posts()) {
        $query->the_post();

        $post_id    = get_the_ID();
        $title      = get_the_title();
        $link       = get_permalink();
        $author     = get_the_author();
        $excerpt    = get_the_excerpt();
        $date       = get_the_date();
        $thumb      = has_post_thumbnail() ? get_the_post_thumbnail_url($post_id, 'medium') : '';
        $categories = get_the_category();

        // Reading time
        $content       = get_the_content();
        $word_count    = str_word_count(wp_strip_all_tags($content));
        $reading_time  = max(1, round($word_count / 250));

        $is_event = false; // Set this if you have event logic
        $date_display = $date; // Adjust if you have custom event date
        $location = '';
        $is_post = ($post_type === 'post');
        $block_classes = $swiper_enabled ? 'swiper-slide' : 'grid-item';
        $is_sticky = is_sticky($post_id);
        $featured_class = ($featured_sticky && $is_sticky) ? ' featured' : '';
        $a_classes = $block_classes . ' card post-card' . $featured_class;

        echo '<div class="' . esc_attr($block_classes) . '">';
        echo '<article class="' . esc_attr(join(' ', get_post_class('card post-card' . $featured_class))) . '">';
        echo '<a href="' . esc_url($link) . '" class="card">';

        if (!empty($attributes['showThumbnails']) && $thumb) {
            echo '<div class="card-thumbnail" style="background-image: url(' . esc_url($thumb) . '); background-size: cover; background-position: center center;">';
            if ($is_event && $date_display) {
                echo '<div class="card-date"><span class="datetime">' . esc_html($date_display) . '</span></div>';
            }

            if ($is_event && $location) {
                echo '<div class="card-location">';
                // Replace be_icon with your icon logic if needed
                echo be_icon(['icon' => 'close', 'size' => 16]);
                echo esc_html($location);
                echo '</div>';
            }
            echo '</div>';
        }

        echo '<div class="card-meta">';
        echo '<div>';
        echo '<div class="category-reading-time">';
        if ($is_post && !empty($categories)) {
            echo '<div class="card-category">';
            foreach ($categories as $cat) {
                echo '<span>' . esc_html($cat->name) . '</span>';
            }
            echo '</div>';
        }
        if ($reading_time) {
            echo '<div class="card-reading-time">' . esc_html($reading_time . ' min read') . '</div>';
        }
        echo '</div>';

        echo '<div>';
        if ($title) {
            echo '<h2 class="card-title">' . esc_html($title) . '</h2>';
        }
        if (!empty($excerpt)) {
            echo '<p class="card-excerpt">' . esc_html($excerpt) . '</p>';
        }
        echo '</div>';
        echo '</div>';

        if ($is_event || $is_post) {
            echo '<div class="readmore"><span>Learn More</span></div>';
        }
        echo '</div>';
        echo '</a>';
        echo '</article>';
        echo '</div>';
    }
    wp_reset_postdata();
} else {
    echo '<p>No posts found.</p>';
}

echo '</div>'; // swiper-wrapper or grid
// Swiper controls
if ($swiper_enabled) {
    if (!empty($attributes['swiperPaginationType']) && $attributes['swiperPaginationType'] !== 'none') {
        echo '<div class="swiper-pagination swiper-pagination-' . esc_attr($attributes['swiperPaginationType']) . '"></div>';
    }
    if (!empty($attributes['swiperNavigation'])) {
        echo '<div class="swiper-button-prev"></div>';
        echo '<div class="swiper-button-next"></div>';
    }
    echo '</div>'; // swiper-container
}

echo '</div>'; // latest-news-block
