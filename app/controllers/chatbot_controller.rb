# app/controllers/chatbot_controller.rb
class ChatbotController < ApplicationController
  include ActionController::Live

  def index
    @messages = [] # You might want to load previous messages from a database
  end

  def send_message
    @message = params[:message]
    ChatbotChannel.broadcast_to('chatbot', { message: @message, sender: 'user' })

    response.headers['Content-Type'] = 'text/event-stream'

    begin
      LlmService.generate_response(@message) do |token|
        ChatbotChannel.broadcast_to('chatbot', {
                                      message: token,
                                      sender: 'llm',
                                      is_last: false
                                    })
        response.stream.write("data: #{token}\n\n")
      end
    rescue StandardError => e
      ChatbotChannel.broadcast_to('chatbot', {
                                    message: "Error: #{e.message}",
                                    sender: 'llm',
                                    is_last: true
                                  })
    ensure
      ChatbotChannel.broadcast_to('chatbot', {
                                    message: '',
                                    sender: 'llm',
                                    is_last: true
                                  })
      response.stream.close
    end
  end
end
