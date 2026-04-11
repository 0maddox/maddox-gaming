class LiveUpdatesChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'live_updates'
  end
end
