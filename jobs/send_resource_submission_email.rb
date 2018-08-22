require_dependency 'email/sender'

module Jobs
  class SendResourceSubmissionEmail < Jobs::Base
    sidekiq_options queue: 'critical'

    def execute(args)
      raise Discourse::InvalidParameters.new(:to_address) unless args[:to_address].present?

      message = ResourceMailer.submission_email(args[:to_address], args[:submission])
      Email::Sender.new(message, :submission_email).send
    end
  end
end
