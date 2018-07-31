import { ajax } from 'discourse/lib/ajax';
import Category from 'discourse/models/category';
import { placeLabel } from 'discourse/plugins/civically-place/discourse/lib/place-utilities';

export default Ember.Route.extend({
  beforeModel(transition) {
    const params = transition.params[transition.targetName];

    if (!params.tags || (!params.category)) {
      return this.replaceWith('/');
    } else {
      const category = Category.findBySlug(
        params.category,
        params.parent_category,
        params.grandparent_category
      );

      if (!category) {
        return this.replaceWith('/');
      }

      let tags = params.tags.split('/');
      const tagData = this.buildTagData(tags);

      if (!tagData['subjects'] || !tagData['actions']) {
        return this.replaceWith('/');
      }

      this.setProperties({
        tagData,
        category
      });
    }
  },

  model(params) {
    let url = '/r';
    if (!params.category) return {};

    if (params.grandparent_category) url += `/${params.grandparent_category}`;
    if (params.parent_category) url += `/${params.parent_category}`;

    url += `/${params.category}/t/${params.tags}`;

    return ajax(url);
  },

  setupController(controller, model) {
    const categoryId = this.get('category.id');
    const tagData = this.get('tagData');

    let props = {
      articles: [],
      events: [],
      services: [],
      title: this.buildTitle(tagData, categoryId),
      categoryId
    };

    Object.keys(model).forEach((k) => {
      if (['articles', 'events', 'services'].indexOf(k) > -1) {
        props[k] = model[k].topic_list.topics;
      }
    });

    this.controllerFor('resource').setProperties(props);
  },

  buildTagData(tags) {
    const civicallyTags = this.get('site.civically_tags');

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
  },

  buildTitle(tagData, categoryId) {
    let title = I18n.t('resource.title.start');
    title += ` ${tagData['subjects']}`;
    title += ` ${this.pluralizeAction(tagData['actions'])}`;
    title += ` ${I18n.t('resource.title.before_location')}`;
    title += ` ${placeLabel(categoryId, { noParents: true })}`;
    return title;
  },

  pluralizeAction(word) {
    if (word === 'compliance') {
      return word;
    } else {
      return word + 's';
    }
  }
});
