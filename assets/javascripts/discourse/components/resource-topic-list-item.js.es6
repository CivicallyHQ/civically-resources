import DiscourseURL from 'discourse/lib/url';

export default Ember.Component.extend({
  classNames: 'resource-topic-list-item',
  showPosters: Ember.computed.equal('type', 'discussions'),
  showRating: Ember.computed.equal('type', 'services'),
  showVotes: Ember.computed.equal('type', 'content'),

  click(e) {
    const isLink = this.$(e.target).prop("tagName").toLowerCase() === 'a';
    if (isLink) return true;

    const t = this.get('topic');
    const currentUser = this.get('currentUser');
    if (!currentUser && t.featured_link) {
      window.location.href = t.featured_link;
    } else {
      DiscourseURL.routeTo(t.get('url'));
    };
  }
});
