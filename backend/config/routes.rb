Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  root to: 'health#show'
  get '/up', to: 'health#show'
  post '/api/mpesa/pay', to: 'api/mpesa#pay'
  post '/api/mpesa/callback', to: 'api/v1/payment_webhooks#mpesa_callback'

  namespace :api do
    namespace :v1 do
      post '/login', to: 'users#login'
      resources :password_resets, only: [:create, :update], param: :token
      resources :direct_uploads, only: [:create]
      get '/users/public_profiles', to: 'users#public_profiles'
      get '/shop_feed', to: 'shop_feed#index'
      resource :cart, only: [:show, :update]
      resources :checkouts, only: [:create] do
        member do
          post :verify
        end
      end
      resources :orders, only: [:index, :show] do
        member do
          post :retry
        end
      end
      get '/finance/summary', to: 'finance_analytics#show'
      post '/payments/flutterwave/webhook', to: 'payment_webhooks#flutterwave'
      post '/payments/mpesa/callback', to: 'payment_webhooks#mpesa_callback'
      get '/codm/leaderboard', to: 'codm#index'
      resources :products
      resources :products do
        resources :reviews, only: [:index, :create]
      end
      resources :team_profiles
      resources :codm_player_stats
      resources :tournaments do
        member do
          post :generate_bracket
          post :simulate_match
          get :matches
          patch 'matches/:match_id', action: :update_match
        end
      end
      resources :users
      resources :follows, only: [:index, :create, :update, :destroy]
      resources :discussion_threads, only: [:index, :show, :create] do
        resources :discussion_comments, only: [:create]
      end
      resources :lft_posts, only: [:index, :create, :update]
      resources :registrations, only: [:create, :index, :destroy]
    end
  end
end