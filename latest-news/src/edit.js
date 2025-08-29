import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { renderPosts } from './renderPosts';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    apiFetch({ path: `/wp/v2/posts?per_page=${attributes.postsToShow}&_embed` })
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [attributes.postsToShow]);

  const settingsPanel = (
    <InspectorControls>
      <PanelBody title="Settings">
        <RangeControl
          label="Number of Posts"
          value={attributes.postsToShow}
          onChange={(value) => setAttributes({ postsToShow: value })}
          min={1}
          max={10}
        />
        <RangeControl
          label="Grid Columns"
          value={attributes.columns}
          onChange={(value) => setAttributes({ columns: value })}
          min={1}
          max={4}
        />
        <ToggleControl
          label="Show Author"
          checked={attributes.showAuthor}
          onChange={() => setAttributes({ showAuthor: !attributes.showAuthor })}
        />
        <ToggleControl
          label="Show Excerpt"
          checked={attributes.showExcerpt}
          onChange={() => setAttributes({ showExcerpt: !attributes.showExcerpt })}
        />
        <ToggleControl
          label="Show Date"
          checked={attributes.showDate}
          onChange={() => setAttributes({ showDate: !attributes.showDate })}
        />
        <ToggleControl
          label="Show Thumbnails"
          checked={attributes.showThumbnails}
          onChange={() => setAttributes({ showThumbnails: !attributes.showThumbnails })}
        />
      </PanelBody>
    </InspectorControls>
  );

  return (
    <div {...blockProps}>
      {settingsPanel}
      {renderPosts(posts || [], attributes)}
    </div>
  );
}