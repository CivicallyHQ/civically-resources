import Category from 'discourse/models/category';

const resourceLink = function(opts) {
  const { category, tags } = opts;
  let url = '/r/' + Category.slugFor(category) + '/t/' + tags.join('/');
  return `<a href='${url}' target='_blank' class="resource-link"><i class='fa fa-list-alt'></i></a>`;
};

const buildTagData = function(tags) {
  const civicallyTags = Discourse.Site.currentProp('civically_tags');

  let tagData = {
    subjects: '',
    actions: '',
    parties: ''
  };

  tags.forEach((tag) => {
    let group = '';

    Object.keys(civicallyTags).forEach((g) => {
      if (civicallyTags[g].indexOf(tag) > -1) {
        group = g;
      }
    });

    tagData[group] = tag;
  });

  return tagData;
};

export { resourceLink, buildTagData };
