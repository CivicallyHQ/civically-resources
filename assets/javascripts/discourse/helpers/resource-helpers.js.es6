import { registerUnbound } from 'discourse-common/lib/helpers';
import { resourceLink } from '../lib/resource-utilities';

registerUnbound('resource-link', function(arg, opts) {
  return new Handlebars.SafeString(resourceLink(opts));
});
