class HealthController < ActionController::API
  def show
    ActiveRecord::Base.connection.execute('SELECT 1')

    render json: {
      status: 'ok',
      service: 'maddox-gaming-api'
    }
  rescue ActiveRecord::ActiveRecordError => e
    render json: {
      status: 'degraded',
      error: e.message
    }, status: :service_unavailable
  end
end