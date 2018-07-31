export default function() {
  this.route('resource', { path: '/r' }, function() {
    this.route('grandparent', { path: ':category/t/*tags' });
    this.route('parent', { path: ':parent_category/:category/t/*tags' });
    this.route('child', { path: ':grandparent_category/:parent_category/:category/t/:tag_id/*tags' });
  });
};
