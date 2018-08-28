import { placeLabel } from 'discourse/plugins/civically-place/discourse/lib/place-utilities';
import { default as computed } from 'ember-addons/ember-computed-decorators';
import showModal from "discourse/lib/show-modal";
import DiscourseURL from 'discourse/lib/url';

const typeFilters = {
  content: 'content',
  services: 'ratings',
  discussions: 'latest',
  events: 'agenda'
};

export default Ember.Controller.extend({
  @computed
  addLabel() {
    const isMobile = this.get('site.mobileView');
    return isMobile ? '' : 'resource.add.label';
  },

  @computed('addLabel')
  buttonName(addLabel) {
    let name = `"<i class='fa fa-plus'></i>`;
    if (addLabel) name += ` ${I18n.t(addLabel)}`;
    name += '"';
    return name;
  },

  @computed('category.id')
  placeName(categoryId) {
    return placeLabel(categoryId, { noParents: true });
  },

  @computed('tagData.subjects', 'tagData.actions', 'placeName')
  resourceName(subject, action, place) {
    return I18n.t('resource.name', {
      subject,
      action,
      place
    });
  },

  pluralizeAction(word) {
    if (word === 'compliance') {
      return word;
    } else {
      return word + 's';
    }
  },

  @computed
  discussionListClasses() {
    let classes = 'list';
    if (!this.get('currentUser')) classes += ' guest';
    return classes;
  },

  actions: {
    addResource(type) {
      const controller = showModal('add-resource', {
        model: {
          resourceName: this.get('resourceName'),
          place: placeLabel(this.get('category.id')),
          type
        }
      });

      controller.setup();
    },

    goTo(type) {
      const user = this.get('currentUser');
      const categoryUrl = this.get('category.url');
      const tags = this.get('tags');
      const filter = typeFilters[type];
      if (user) {
        DiscourseURL.routeTo(categoryUrl + '/l/' + filter + '?match_tags=' + encodeURIComponent(tags.join(',')));
      }
    }
  }
});
