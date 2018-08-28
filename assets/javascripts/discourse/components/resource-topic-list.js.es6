import BasicTopicList from 'discourse/components/basic-topic-list';
import { default as computed } from 'ember-addons/ember-computed-decorators';
import { canPostType } from 'discourse/plugins/civically-composer-addons/discourse/lib/topic-type-utilities';

export default BasicTopicList.extend({
  classNames: 'resource-topic-list',
  skipHeader: true,
  hideCategory: true,
  showPosters: true,

  @computed('type', 'canPost')
  addResourceKey(type, canPost) {
    let key = 'add';
    if (canPost) {
      key = 'post';
    }
    return `resource.${type}.${key}`;
  },

  @computed('type')
  canPost(type) {
    const user = this.get('currentUser');
    return user && canPostType(user, type);
  },

  actions: {
    actionResource() {
      let action = 'addResource';

      if (this.get('canPost')) {
        action = 'postResource';
      }

      this.sendAction(action, this.get('type'));
    }
  }
});
