import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from 'discourse/lib/ajax-error';
import { default as computed } from 'ember-addons/ember-computed-decorators';
import { cookAsync } from 'discourse/lib/text';

export default Ember.Component.extend({
  classNames: 'add-resource',
  adding: false,
  link: '',

  @computed('link')
  submitDisabled(link) {
    return link.length < 6;
  },

  actions: {
    add() {
      this.set('adding', true);
    },

    submit() {
      const link = this.get('link');
      if (!link) return;

      this.set('sending', true);

      ajax('/r/add-resource',{
        data: {
          link
        }
      }).catch(popupAjaxError).then((result) => {
        let resultIcon = result.success ? 'check' : 'times';
        this.set('resultIcon', resultIcon);
      }).finally(() => {
        this.set('sending', false);
      });
    }
  }
});
