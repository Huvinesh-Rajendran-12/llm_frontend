# app/services/llm_service.rb
require 'net/http'
require 'json'

class LlmService
  LLM_BACKEND_URL = 'http://your-llm-backend-url.com/generate_stream' # Update this URL

  def self.generate_response(message)
    uri = URI(LLM_BACKEND_URL)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      request = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')
      request.body = { message: }.to_json

      http.request(request) do |response|
        raise "LLM Backend Error: #{response.code} - #{response.message}" unless response.is_a?(Net::HTTPSuccess)

        response.read_body do |chunk|
          yield JSON.parse(chunk)['token'] if block_given?
        end
      end
    end
  end
end
