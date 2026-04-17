class PasswordResetMailer < ApplicationMailer
  def reset(user_id, token)
    @user = User.find(user_id)
    @reset_url = "#{ENV.fetch('BASE_URL', 'http://localhost:3001')}/reset-password?token=#{token}"

    mail(
      to: @user.email,
      subject: 'Reset your Maddox Gaming password'
    )
  end
end