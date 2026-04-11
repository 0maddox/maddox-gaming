Rails.application.routes.draw do
  mount ActionCable.server => '/cable'

  namespace :api do
    namespace :v1 do
      post '/login', to: 'users#login'
      get '/shop_feed', to: 'shop_feed#index'
      resources :products
      resources :tournaments
      resources :users
      resources :registrations, only: [:create, :index, :destroy]
    end
  end
end