class Api::V1::FinanceAnalyticsController < ApplicationController
  def show
    unless current_user&.can?('view_analytics') || current_user&.can?('manage_finance')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    paid_orders = Order.where(status: 'paid')
    date_range = 13.days.ago.to_date..Date.current
    daily_data = paid_orders.where(paid_at: date_range.first.beginning_of_day..date_range.last.end_of_day)
                           .group('DATE(paid_at)')
                           .sum(:total_amount)
    order_counts = paid_orders.where(paid_at: date_range.first.beginning_of_day..date_range.last.end_of_day)
                              .group('DATE(paid_at)')
                              .count

    render json: {
      total_revenue: paid_orders.sum(:total_amount).to_f,
      paid_orders_count: paid_orders.count,
      average_order_value: paid_orders.average(:total_amount).to_f,
      pending_orders_count: Order.where(status: 'pending').count,
      failed_orders_count: Order.where(status: 'failed').count,
      payment_method_breakdown: paid_orders.group(:payment_method).sum(:total_amount).map do |method, amount|
        { method: method, revenue: amount.to_f }
      end,
      gateway_breakdown: paid_orders.group(:gateway_name).sum(:total_amount).map do |gateway, amount|
        { gateway: gateway, revenue: amount.to_f }
      end,
      daily_revenue: date_range.map do |date|
        {
          date: date.iso8601,
          revenue: daily_data.fetch(date.to_s, 0).to_f,
          orders_count: order_counts.fetch(date.to_s, 0)
        }
      end,
      recent_payments: paid_orders.includes(:user).order(paid_at: :desc).limit(8).map do |order|
        {
          id: order.id,
          user_email: order.user&.email,
          username: order.user&.username,
          amount: order.total_amount.to_f,
          paid_at: order.paid_at,
          payment_method: order.payment_method,
          gateway_name: order.gateway_name,
          transaction_id: order.transaction_id
        }
      end
    }
  end
end
