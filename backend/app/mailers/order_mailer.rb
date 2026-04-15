class OrderMailer < ApplicationMailer
  def payment_status(order_id)
    @order = Order.includes(:user).find(order_id)
    @user = @order.user
    @status_label = @order.paid? ? 'confirmed' : 'failed'

    mail(
      to: @user.email,
      subject: "Maddox Gaming payment #{@status_label} for order ##{@order.id}"
    )
  end
end
