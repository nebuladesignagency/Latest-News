<?php
$attributes = $attributes ?? [];

echo '<div 
    class="latest-news-block" 
    data-attributes="' . esc_attr(wp_json_encode($attributes)) . '"
    ' . get_block_wrapper_attributes() . '
></div>';