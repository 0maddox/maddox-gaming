class Api::V1::FollowsController < ApplicationController
  def index
    accepted_sent = current_user.sent_follows.accepted.includes(:followed)
    accepted_received = current_user.received_follows.accepted.includes(:follower)
    pending_requests = current_user.received_follows.where(status: 'pending').includes(:follower)

    render json: {
      friends: (accepted_sent.map(&:followed) + accepted_received.map(&:follower)).uniq.map do |friend|
        friend.community_profile_json.except('email')
      end,
      pending_requests: pending_requests.map do |follow|
        {
          id: follow.id,
          follower: follow.follower.community_profile_json.except('email')
        }
      end
    }
  end

  def create
    followed = User.find_by(id: params[:followed_id])
    return render json: { error: 'User not found' }, status: :not_found unless followed

    follow = current_user.sent_follows.find_or_initialize_by(followed: followed)
    follow.status = 'pending'

    if follow.save
      render json: follow.as_json(include: { followed: { only: [:id, :username] } }), status: :created
    else
      render json: { error: follow.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    follow = current_user.received_follows.find(params[:id])
    status = params[:status].to_s

    unless %w[accepted pending].include?(status)
      return render json: { error: 'Invalid status' }, status: :unprocessable_entity
    end

    follow.update!(status: status)
    render json: follow
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Follow request not found' }, status: :not_found
  end

  def destroy
    follow = Follow.where(id: params[:id]).where('follower_id = ? OR followed_id = ?', current_user.id, current_user.id).first
    return render json: { error: 'Follow relation not found' }, status: :not_found unless follow

    follow.destroy
    head :no_content
  end
end
