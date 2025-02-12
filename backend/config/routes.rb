Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post '/login', to: 'users#login'
      resources :products
      resources :tournaments
      resources :users
      resources :registrations, only: [:create, :index, :destroy]
    end
  end
end