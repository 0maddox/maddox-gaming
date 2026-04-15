class DiscussionThread < ApplicationRecord
  belongs_to :user
  has_many :discussion_comments, dependent: :destroy

  validates :title, presence: true, length: { maximum: 140 }
  validates :body, presence: true

  def as_api_json
    as_json.merge(
      'author' => user.as_json(only: [:id, :username]),
      'comments_count' => discussion_comments.count
    )
  end
end
