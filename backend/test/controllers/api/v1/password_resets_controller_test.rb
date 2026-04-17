require 'test_helper'

class Api::V1::PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    ActionMailer::Base.deliveries.clear
    @user = User.create!(
      name: 'Reset User',
      username: 'reset_user',
      email: 'reset@example.com',
      phone_number: '0712345678',
      password: 'old-password',
      password_confirmation: 'old-password'
    )
  end

  test 'create stores a reset digest and sends email for known user' do
    post '/api/v1/password_resets', params: { email: @user.email }, as: :json

    assert_response :success
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_match(/If an account exists/, response.parsed_body['message'])

    @user.reload
    assert_not_nil @user.password_reset_token_digest
    assert_not_nil @user.password_reset_sent_at
  end

  test 'create is generic for unknown user' do
    post '/api/v1/password_resets', params: { email: 'missing@example.com' }, as: :json

    assert_response :success
    assert_equal 0, ActionMailer::Base.deliveries.size
    assert_match(/If an account exists/, response.parsed_body['message'])
  end

  test 'update resets password with valid token' do
    token = @user.generate_password_reset_token!

    patch "/api/v1/password_resets/#{token}", params: {
      password: 'new-password',
      password_confirmation: 'new-password'
    }, as: :json

    assert_response :success

    @user.reload
    assert_nil @user.password_reset_token_digest
    assert_nil @user.password_reset_sent_at
    assert @user.authenticate('new-password')
  end

  test 'update rejects expired token' do
    token = @user.generate_password_reset_token!
    @user.update_column(:password_reset_sent_at, 3.hours.ago)

    patch "/api/v1/password_resets/#{token}", params: {
      password: 'new-password',
      password_confirmation: 'new-password'
    }, as: :json

    assert_response :unprocessable_entity
    assert_match(/invalid or has expired/i, response.parsed_body['error'])
  end
end