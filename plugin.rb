# name: civically-resources
# about: Resource pages for categories and tags
# version: 0.1
# authors: angus
# url: https://github.com/angusmcleod/civically-resources

register_asset 'stylesheets/resource.scss'

after_initialize do
  module ::CivicallyResources
    class Engine < ::Rails::Engine
      engine_name "civically_resources"
      isolate_namespace CivicallyResources
    end
  end

  CivicallyResources::Engine.routes.draw do
    get ':category/t/*tags' => 'resource#show'
    get ':parent_category/:category/t/*tags' => 'resource#show'
    get ':grandparent_category/:parent_category/:category/t/*tags' => 'resource#show'
  end

  Discourse::Application.routes.append do
    mount ::CivicallyResources::Engine, at: "r"
  end

  class CivicallyResources::ResourceController < ::ApplicationController
    def show
      category = Category.find_by(slug: params[:category])
      tags = params[:tags].split('/')

      user = Discourse.system_user

      query_opts = {
        category: category.id,
        tags: tags,
        limit: 4
      }

      query = TopicQuery.new(user, query_opts)

      events_list = query.list_agenda
      articles_list = query.list_articles
      services_list = query.list_ratings

      render_json_dump(
        articles: TopicListSerializer.new(articles_list, scope: guardian),
        events: TopicListSerializer.new(events_list, scope: guardian),
        services: TopicListSerializer.new(services_list, scope: guardian),
      )
    end
  end

  require_dependency 'topic_query'
  class ::TopicQuery
    def list_articles
      create_list(:articles) do |topics|
        topics.where("featured_link IS NOT NULL")
      end
    end
  end

  CIVICALLY_TAG_GROUPS = [
    'civically_actions',
    'civically_parties',
    'civically_subjects'
  ]

  add_to_class(:site, :civically_tags) do
    @civically_tags ||= begin
      Tag.joins('JOIN tag_group_memberships ON tags.id = tag_group_memberships.tag_id')
        .joins('JOIN tag_groups ON tag_group_memberships.tag_group_id = tag_groups.id')
        .where('tag_groups.name in (?)', CIVICALLY_TAG_GROUPS)
        .group('tag_groups.name, tags.name')
        .pluck('tag_groups.name, tags.name')
        .each_with_object({}) do |arr, result|
          type = arr[0].split("_").last
          result[type] = [] if result[type].blank?
          result[type].push(arr[1])
        end
    end
  end

  add_to_serializer(:site, :civically_tags) { object.civically_tags }
end
