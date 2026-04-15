class Api::V1::DiscussionThreadsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show]

  def index
    threads = DiscussionThread.includes(:user).order(created_at: :desc).limit(80)
    render json: threads.map(&:as_api_json)
  end

  def show
    thread = DiscussionThread.includes(:discussion_comments).find(params[:id])
    render json: thread.as_api_json.merge(
      'comments' => thread.discussion_comments.includes(:user).order(created_at: :asc).map(&:as_api_json)
    )
  end

  def create
    thread = current_user.discussion_threads.new(thread_params)
    if thread.save
      render json: thread.as_api_json, status: :created
    else
      render json: { error: thread.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def thread_params
    params.require(:discussion_thread).permit(:title, :body, :topic_type, :topic_id)
  end
end
