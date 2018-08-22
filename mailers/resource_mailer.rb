require_dependency 'email/message_builder'

class ResourceMailer < ActionMailer::Base
  include Email::BuildEmailHelper

  def submission_email(to_address, submission)
    build_email(
      to_address,
      template: 'submission_email',
      place: submission['place'],
      type: submission['type'],
      name: submission['name'],
      email: submission['email'],
      url: submission['url']
    )
  end
end
