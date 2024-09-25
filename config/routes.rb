# config/routes.rb
Rails.application.routes.draw do
  root 'chatbot#index'
  post 'send_message', to: 'chatbot#send_message'
end
