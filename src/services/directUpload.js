import { DirectUpload } from '@rails/activestorage';
import { API_URL } from '../config/env';

const DIRECT_UPLOADS_URL = `${API_URL}/direct_uploads`;

export const uploadFileDirect = (file) => {
  const token = localStorage.getItem('token');

  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      DIRECT_UPLOADS_URL,
      undefined,
      token ? { Authorization: `Bearer ${token}` } : {}
    );

    upload.create((error, blob) => {
      if (error) {
        reject(new Error(typeof error === 'string' ? error : 'Upload failed.'));
        return;
      }

      resolve({
        signedId: blob.signed_id,
        filename: blob.filename,
      });
    });
  });
};