import { default as computed } from 'ember-addons/ember-computed-decorators';
import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from 'discourse/lib/ajax-error';

export default Ember.Controller.extend({
  types: ['content', 'services', 'events'],
  adding: false,
  url: '',

  @computed('type')
  descriptionKey(type) {
    return `resource.add.description.${type}`;
  },

  setup() {
    let type = this.get('model.type') || 'content';
    this.setProperties({
      type,
      name: '',
      email: '',
      url: ''
    });
  },

  @computed('type', 'types')
  typeButtons(type, types) {
    const baseClass = '';

    let buttons = [];
    types.forEach((t) => {
      let classes = baseClass;
      if (t === type) classes += ' btn-primary';
      buttons.push({
        class: classes,
        name: t,
        label: `resource.${t}.label`
      });
    });

    return buttons;
  },

  @computed('url')
  submitDisabled(url) {
    return !url || url.length < 6;
  },

  actions: {
    submit() {
      let url = this.get('url');
      if (this.get('submitDisabled')) return;

      let data = {
        place: this.get('model.place'),
        url,
        email: this.get('email'),
        type: this.get('type'),
        name: this.get('name')
      };

      this.set('sending', true);

      ajax('/r/submit', {
        type: 'POST',
        data
      }).catch(popupAjaxError).then((result) => {
        let resultIcon = result.success ? 'check' : 'times';
        this.set('resultIcon', resultIcon);
      }).finally(() => {
        this.set('sending', false);
      });
    },

    close() {
      this.send('closeModal');
    },

    setType(type) {
      this.set('type', type);
    }
  }
});
