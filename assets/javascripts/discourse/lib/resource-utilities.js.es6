import Category from 'discourse/models/category';

const resourceLink = function(opts) {
  const { category, tags } = opts;
  let url = '/r/' + Category.slugFor(category) + '/t/' + tags.join('/');
  return `<a href='${url}' target='_blank' class="resource-link"><i class='fa fa-list-alt'></i></a>`;
};

export { resourceLink };
