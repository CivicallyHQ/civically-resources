import { buildTagData } from '../../lib/resource-utilities';

export default {
  setupComponent(attrs, component) {
    const tagData = buildTagData(attrs.topic.tags);
    component.set('showResourceLink', tagData['subjects'] && tagData['actions']);
  }
};
