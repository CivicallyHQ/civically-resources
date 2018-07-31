import resourceRoute from '../routes/resource';

export default {
  name: 'resource-pre-initializer',
  initialize(registry, app) {
    app.ResourceGrandparentRoute = resourceRoute.extend();
    app.ResourceParentRoute = resourceRoute.extend();
    app.ResourceChildRoute = resourceRoute.extend();
  }
};
