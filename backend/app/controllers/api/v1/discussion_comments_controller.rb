class Api::V1::DiscussionCommentsController < ApplicationController
  def create
    thread = DiscussionThread.find(params[:discussion_thread_id])
    comment = thread.discussion_comments.new(comment_params)
    comment.user = current_user

    if comment.save
      render json: comment.as_api_json, status: :created
    else
      render json: { error: comment.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:discussion_comment).permit(:body)
  end
end
