<?php
/**
 * Plugin Name:       Latest News
 * Description:       A custom block to display latest news posts with Ajax.
 * Version:           1.0.0
 */

function latest_news_register_block() {
  register_block_type(__DIR__);

  // Frontend Ajax handling
  wp_register_script(
    'latest-news-frontend',
    plugins_url('build/frontend.js', __FILE__),
    array('wp-api-fetch'),
    '1.0.0',
    true
  );

  wp_enqueue_script('latest-news-frontend');
}
add_action('init', 'latest_news_register_block');