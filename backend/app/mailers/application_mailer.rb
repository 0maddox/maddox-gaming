class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_FROM_ADDRESS', 'no-reply@maddox-gaming.local')
  layout "mailer"
end
