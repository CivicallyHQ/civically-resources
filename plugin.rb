# name: civically-resources
# about: Resource pages for categories and tags
# version: 0.1
# authors: angus
# url: https://github.com/angusmcleod/civically-resources

register_asset 'stylesheets/resource.scss'

Discourse.top_menu_items.push(:content)
Discourse.anonymous_top_menu_items.push(:content)
Discourse.filters.push(:content)
Discourse.anonymous_filters.push(:content)

after_initialize do
  module ::CivicallyResources
    class Engine < ::Rails::Engine
      engine_name "civically_resources"
      isolate_namespace CivicallyResources
    end
  end

  CivicallyResources::Engine.routes.draw do
    post 'submit' => 'resource#submit'
    get ':category/t/*tags' => 'resource#show'
    get ':parent_category/:category/t/*tags' => 'resource#show'
    get ':grandparent_category/:parent_category/:category/t/*tags' => 'resource#show'
  end

  Discourse::Application.routes.append do
    mount ::CivicallyResources::Engine, at: "r"

    scope "/multi" do
      constraints(tag_id: /[^\/]+?/, format: /json|rss/) do
        get '/c/:category/t/:tag_id/*tags' => 'tags#show', as: 'tags_category_show'
        get '/c/:parent_category/:category/t/:tag_id/*tags' => 'tags#show', as: 'tags_parent_category_category_show'
        get '/c/:grandparent_category/:parent_category/:category/t/:tag_id/*tags' => 'tags#show', as: 'tags_grandparent_category_category_show'

        Discourse.filters.each do |filter|
          get "/c/:category/t/:tag_id/*tags/l/#{filter}" => "tags#show_#{filter}", as: "tags_category_show_#{filter}"
          get "/c/:parent_category/:category/t/:tag_id/*tags/l/#{filter}" => "tags#show_#{filter}", as: "tags_parent_category_category_show_#{filter}"
          get "/c/:grandparent_category/:parent_category/:category/t/:tag_id/*tags/l/#{filter}" => "tags#show_#{filter}", as: "tags_grandparent_category_category_show_#{filter}"
        end
      end
    end
  end

  load File.expand_path('../jobs/send_resource_submission_email.rb', __FILE__)
  load File.expand_path('../mailers/resource_mailer.rb', __FILE__)

  module ListControllerResourceExtension
    private def build_topic_list_options
      options = super
      if params[:match_tags].present?
        tags = params[:match_tags].split(',').slice(0, 3)
        options[:tags] = tags.map { |t| t.gsub(/_/, ' ').downcase }
        options[:match_all_tags] = true
      end
      options
    end
  end

  require_dependency 'list_controller'
  class ::ListController
    prepend ListControllerResourceExtension
  end

  TopicQuery.add_custom_filter(:featured_link) do |topics, query|
    if query.options[:featured_link]
      topics.where("featured_link IS NOT NULL")
    else
      topics
    end
  end

  require_dependency 'topic_query'
  class ::TopicQuery
    def list_content
      create_list(:content, unordered: true) do |topics|
        topics.where(subtype: 'content')
          .joins("left join topic_custom_fields tfv ON tfv.topic_id = topics.id AND tfv.name = 'vote_count'")
          .order("coalesce(tfv.value,'0')::integer desc, topics.bumped_at desc")
      end
    end
    def list_discussions
      create_list(:discussions) do |topics|
        topics.where(subtype: 'general')
      end
    end
  end

  class CivicallyResources::ResourceController < ::ApplicationController
    def show
      category = Category.find_by(slug: params[:category])
      tags = params[:tags].split('/')

      query_params = {
        match_all_tags: true,
        category: category.id,
        tags: tags,
        limit: 4
      }

      query = ::TopicQuery.new(Discourse.system_user, query_params)

      content_list = query.list_content
      discussions_list = query.list_discussions
      events_list = query.list_agenda
      services_list = query.list_top_ratings

      render_json_dump(
        content: TopicListSerializer.new(content_list, scope: guardian),
        events: TopicListSerializer.new(events_list, scope: guardian),
        services: TopicListSerializer.new(services_list, scope: guardian),
        discussions: TopicListSerializer.new(discussions_list, scope: guardian)
      )
    end

    def submit
      submission = params.permit(:type, :name, :email, :url, :place)

      begin
        Jobs::SendResourceSubmissionEmail.new.execute(
          to_address: SiteSetting.landing_contact_email,
          submission: submission.to_h
        )
        render json: success_json
      rescue => e
        render json: { error: e }, status: 422
      end
    end
  end
end
