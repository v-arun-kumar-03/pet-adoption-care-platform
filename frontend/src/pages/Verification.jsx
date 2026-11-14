// src/pages/Verification.jsx
// Shelter page for uploading private verification documents.

import { useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatFileSize } from '../utils/format';
import { openPrivateDocument } from '../utils/documents';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export default function Verification() {
  const { user, setUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handleFileChange(event) {
    const selected = Array.from(event.target.files);
    setError('');

    if (selected.length > 3) {
      setError('You can upload a maximum of 3 files at a time.');
      return;
    }

    for (const file of selected) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, WEBP images and PDF files are allowed.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Each file must be 5 MB or smaller.');
        return;
      }
    }

    setFiles(selected);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (files.length === 0) {
      setError('Please choose at least one document.');
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));

    setUploading(true);

    try {
      const response = await api.post('/users/documents', formData);
      setUser(response.data.user);
      setFiles([]);
      formElement.reset();
      setNotice(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(document) {
    if (!window.confirm(`Remove ${document.originalName}?`)) return;

    try {
      const response = await api.delete(`/users/documents/${document.filename}`);
      setUser(response.data.user);
      setNotice('Document removed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleView(document) {
    try {
      await openPrivateDocument(document.filename);
    } catch (err) {
      setError('Could not open the document. Please try again.');
    }
  }

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Shelter verification"
        title="Verification documents"
        subtitle="Upload a shelter licence, registration certificate or similar proof. Files are private."
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      <div className="verification-status card">
        <div>
          <p className="eyebrow">Current status</p>
          <div className="verification-title">
            <h2>{user.shelterName || user.name}</h2>
            <StatusBadge status={user.verificationStatus} />
          </div>
          {user.verificationNote && (
            <p className="review-note">💬 Admin note: {user.verificationNote}</p>
          )}
          <p className="muted">
            {user.verificationStatus === 'approved'
              ? 'Your shelter is verified. You can add pets and receive applications.'
              : 'An admin reviews documents before your shelter can add pets.'}
          </p>
        </div>
      </div>

      <div className="detail-columns">
        <section className="card">
          <div className="card-heading">
            <h2>Uploaded documents</h2>
            <span className="count-pill">{user.documents.length}</span>
          </div>

          {user.documents.length === 0 ? (
            <p className="muted">No documents uploaded yet.</p>
          ) : (
            <div className="document-list">
              {user.documents.map((document) => (
                <div className="document-row" key={document.filename}>
                  <div>
                    <strong>📄 {document.originalName}</strong>
                    <small>
                      {formatFileSize(document.size)} • Uploaded{' '}
                      {formatDate(document.uploadedAt)}
                    </small>
                  </div>
                  <div className="document-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => handleView(document)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(document)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Upload more documents</h2>

          <form className="form" onSubmit={handleUpload}>
            <div className="form-group">
              <label htmlFor="documents">Choose files</label>
              <input
                id="documents"
                name="documents"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
              />
              <p className="form-hint">
                Up to 3 files at a time. JPG, PNG, WEBP or PDF. Maximum 5 MB each.
              </p>
            </div>

            {files.length > 0 && (
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file.name}>
                    📎 {file.name} <span className="muted">({formatFileSize(file.size)})</span>
                  </li>
                ))}
              </ul>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload documents'}
            </button>
          </form>

          <div className="info-box">
            <h4>What can I upload?</h4>
            <ul>
              <li>Shelter registration certificate</li>
              <li>Municipal or NGO licence</li>
              <li>Official letter with shelter contact details</li>
            </ul>
            <p className="small muted">
              Files are stored outside the public website. Only you and an admin can open them.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
