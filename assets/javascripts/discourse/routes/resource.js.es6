import { ajax } from 'discourse/lib/ajax';
import Category from 'discourse/models/category';
import TopicList from 'discourse/models/topic-list';
import { placeUrl } from 'discourse/plugins/civically-place/discourse/lib/place-utilities';
import { buildTagData } from '../lib/resource-utilities';

export default Ember.Route.extend({
  beforeModel(transition) {
    const params = transition.params[transition.targetName];

    if (!params.tags || !params.category) {
      return this.replaceWith(placeUrl(this.currentUser));
    } else {
      const category = Category.findBySlug(
        params.category,
        params.parent_category,
        params.grandparent_category
      );

      if (!category) {
        return this.replaceWith(placeUrl(this.currentUser));
      }

      let tags = params.tags.split('/');
      const tagData = buildTagData(tags);

      if (!tagData['subjects'] || !tagData['actions']) {
        return this.replaceWith(placeUrl(this.currentUser));
      }

      this.setProperties({
        tags,
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
    let props = {
      content: [],
      events: [],
      services: [],
      discussions: [],
      tags: this.get('tags'),
      tagData: this.get('tagData'),
      category: this.get('category')
    };

    ['content', 'events', 'services', 'discussions'].forEach((type) => {
      props[type] = TopicList.topicsFrom(this.store, model[type]);
    });

    this.controllerFor('resource').setProperties(props);
  }
});
