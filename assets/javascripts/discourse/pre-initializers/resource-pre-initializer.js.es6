import ResourceRoute from '../routes/resource';

export default {
  name: 'resource-pre-initializer',
  initialize(registry, app) {
    app.ResourceGrandparentRoute = ResourceRoute.extend();
    app.ResourceParentRoute = ResourceRoute.extend();
    app.ResourceChildRoute = ResourceRoute.extend();
  }
};
