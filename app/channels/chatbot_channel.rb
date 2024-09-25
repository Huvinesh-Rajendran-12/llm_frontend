# app/channels/chatbot_channel.rb
class ChatbotChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'chatbot'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
