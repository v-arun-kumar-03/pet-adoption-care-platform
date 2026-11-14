// src/utils/documents.js
// Opens a private verification document as a temporary browser blob.
// A normal <a href> cannot send the JWT header, so we use Axios instead.

import api from '../services/api';

export async function openPrivateDocument(filename) {
  const response = await api.get(`/users/documents/${filename}`, {
    responseType: 'blob',
  });

  const fileUrl = URL.createObjectURL(response.data);
  window.open(fileUrl, '_blank', 'noopener,noreferrer');

  // Free the browser memory after a minute.
  setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
}
