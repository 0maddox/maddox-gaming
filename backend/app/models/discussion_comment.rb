class DiscussionComment < ApplicationRecord
  belongs_to :discussion_thread
  belongs_to :user

  validates :body, presence: true, length: { maximum: 1000 }

  def as_api_json
    as_json.merge(
      'author' => user.as_json(only: [:id, :username])
    )
  end
end
