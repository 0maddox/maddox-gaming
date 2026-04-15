class Api::V1::ProductsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show]
  before_action :set_product, only: [:show, :update, :destroy]
  before_action -> { require_permission!('manage_products') }, only: [:create, :update, :destroy]

  def index
    @products = Product.all
    render json: @products.map(&:as_api_json)
  end

  def show
    render json: @product.as_api_json
  end

  def create
    @product = Product.new(product_params)
    if @product.save
      render json: @product.as_api_json, status: :created
    else
      render json: @product.errors, status: :unprocessable_entity
    end
  end

  def update
    if @product.update(product_params)
      render json: @product.as_api_json
    else
      render json: @product.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @product.destroy
    head :no_content
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(
      :name,
      :description,
      :price,
      :stock,
      :category,
      :image_url,
      :low_stock_threshold,
      :color,
      :variant_model,
      :compatibility,
      variants: [:color, :model, :compatibility]
    )
  end
end