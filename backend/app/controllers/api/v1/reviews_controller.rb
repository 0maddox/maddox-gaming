class Api::V1::ReviewsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]
  before_action :set_product

  def index
    render json: {
      product_id: @product.id,
      average_rating: @product.average_rating,
      ratings_count: @product.ratings_count,
      reviews: @product.reviews.includes(:user).order(created_at: :desc).map do |review|
        review_payload(review)
      end
    }
  end

  def create
    review = @product.reviews.build(review_params)
    review.user = current_user

    if review.save
      render json: review_payload(review), status: :created
    else
      render json: review.errors, status: :unprocessable_entity
    end
  end

  private

  def set_product
    @product = Product.find(params[:product_id])
  end

  def review_params
    params.require(:review).permit(:rating, :comment)
  end

  def review_payload(review)
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user: {
        id: review.user.id,
        username: review.user.username,
        role: review.user.role
      }
    }
  end
end
