<?php
/**
 * Plugin Name: Latest News Swiper Block
 * Plugin URI: https://example.com
 * Description: A custom Gutenberg block to display latest news posts with Swiper functionality, sorting, filtering, and theme integration.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: latest-news-swiper
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

function latest_news_register_block() {
    register_block_type(__DIR__);
}
add_action('init', 'latest_news_register_block');

// Block assets are automatically enqueued by block.json