class Api::V1::LftPostsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]
  before_action :set_lft_post, only: [:update]

  def index
    posts = LftPost.includes(:user).order(created_at: :desc)
    render json: posts.map(&:as_api_json)
  end

  def create
    post = current_user.lft_posts.new(lft_post_params)
    if post.save
      render json: post.as_api_json, status: :created
    else
      render json: { error: post.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    unless @lft_post.user_id == current_user.id || current_user.can?('manage_content')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    if @lft_post.update(lft_post_params)
      render json: @lft_post.as_api_json
    else
      render json: { error: @lft_post.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def set_lft_post
    @lft_post = LftPost.find(params[:id])
  end

  def lft_post_params
    params.require(:lft_post).permit(:game_title, :role_needed, :rank_requirement, :region, :slots_open, :notes, :status)
  end
end
