<?php
/**
 * Plugin Name:       Latest News
 * Description:       A custom block to display latest news posts with Ajax.
 * Version:           1.0.0
 */

function latest_news_register_block() {
  register_block_type(__DIR__);
}
add_action('init', 'latest_news_register_block');