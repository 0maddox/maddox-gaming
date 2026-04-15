class Api::V1::CartsController < ApplicationController
  def show
    cart = current_user.cart || current_user.create_cart!(items: [])
    render json: cart_payload(cart)
  end

  def update
    cart = current_user.cart || current_user.create_cart!(items: [])
    items = normalize_items(params[:items])

    if cart.update(items: items)
      render json: cart_payload(cart)
    else
      render json: cart.errors, status: :unprocessable_entity
    end
  end

  private

  def normalize_items(raw_items)
    return [] unless raw_items.is_a?(Array)

    raw_items.filter_map do |item|
      next unless item.is_a?(ActionController::Parameters) || item.is_a?(Hash)

      row = item.is_a?(ActionController::Parameters) ? item.to_unsafe_h.symbolize_keys : item.to_h.symbolize_keys
      product_id = row[:product_id].to_i
      quantity = [row[:quantity].to_i, 0].max

      next if product_id <= 0 || quantity <= 0

      {
        product_id: product_id,
        name: row[:name].to_s,
        price: row[:price].to_f,
        quantity: quantity,
        # Support both string and symbol keys coming from JSON and JS callers.
        variant_row: row[:variant].is_a?(ActionController::Parameters) ? row[:variant].to_unsafe_h : row[:variant]
      }.then do |base|
        variant_row = base.delete(:variant_row)
        variant_hash = variant_row.is_a?(Hash) ? variant_row.to_h.symbolize_keys : {}

        base.merge(
          variant: {
            color: variant_hash[:color].to_s.presence || row[:color].to_s.presence,
            model: variant_hash[:model].to_s.presence || row[:model].to_s.presence,
            compatibility: variant_hash[:compatibility].to_s.presence || row[:compatibility].to_s.presence
          }.compact,
          updated_at: Time.current.iso8601
        )
      end
    end
  end

  def cart_payload(cart)
    {
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items || [],
      updated_at: cart.updated_at
    }
  end
end
