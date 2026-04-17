require "test_helper"

class Api::V1::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      name: 'Login User',
      username: 'login_user',
      email: 'login@example.com',
      phone_number: '0712345678',
      password: 'secret-pass'
    )
  end

  test 'login succeeds with normalized email input' do
    post '/api/v1/login', params: {
      email: '  LOGIN@example.com  ',
      password: 'secret-pass'
    }, as: :json

    assert_response :success
    assert_equal @user.id, response.parsed_body.dig('user', 'id')
    assert response.parsed_body['token'].present?
  end

  test 'signup normalizes email before save' do
    post '/api/v1/users', params: {
      user: {
        username: 'new_login_user',
        email: '  MixedCase@example.com ',
        password: 'secret-pass',
        phone_number: '0711111111'
      }
    }, as: :json

    assert_response :created
    assert_equal 'mixedcase@example.com', response.parsed_body.dig('user', 'email')
  end
end
