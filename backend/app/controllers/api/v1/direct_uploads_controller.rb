class Api::V1::DirectUploadsController < ApplicationController
  skip_before_action :authenticate_request, only: [:create]

  def create
    blob = ActiveStorage::Blob.create_before_direct_upload!(**direct_upload_params)

    render json: {
      signed_id: blob.signed_id,
      key: blob.key,
      filename: blob.filename.to_s,
      content_type: blob.content_type,
      byte_size: blob.byte_size,
      direct_upload: {
        url: blob.service_url_for_direct_upload,
        headers: blob.service_headers_for_direct_upload
      }
    }, status: :created
  end

  private

  def direct_upload_params
    params.require(:blob).permit(:filename, :byte_size, :checksum, :content_type, metadata: {}).to_h.symbolize_keys
  end
end