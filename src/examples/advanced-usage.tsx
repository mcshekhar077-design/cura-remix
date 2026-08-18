import React, { useState } from 'react';
import {
  useAdvancedQuery,
  usePaginatedQuery,
  useFileUpload,
  useFunction,
  useTrigger,
} from '../hooks/useSupabaseAdvanced';
import { updateProfile, resetPassword } from '../lib/supabase/auth';
import { getOptimizedImageUrl } from '../lib/supabase/storage';

// ============== Advanced Query Example ==============
export const UsersList: React.FC = () => {
  const { data, loading, error, count, refetch } = useAdvancedQuery<{ id: string; email: string; username: string; created_at: string }>(
    'users',
    (builder) =>
      builder
        .select(['id', 'email', 'username', 'created_at'])
        .where('is_active', 'eq', true)
        .orderBy('created_at', false)
        .limit(20),
    [],
    { autoRefresh: true, refreshInterval: 30000 }
  );

  if (loading) return <div id="users-loading">Loading users...</div>;
  if (error) return <div id="users-error">Error: {error.message}</div>;

  return (
    <div id="users-list-section" className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Users ({count})</h2>
        <button
          id="btn-refresh-users"
          type="button"
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {data.map((user) => (
          <li key={user.id} className="py-2 flex justify-between">
            <span className="font-medium">{user.username}</span>
            <span className="text-gray-500 text-sm">{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============== Paginated Query Example ==============
export const PaginatedPosts: React.FC = () => {
  const {
    data,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePaginatedQuery<{ id: string; title: string; published: boolean }>(
    'posts',
    1,
    10,
    { published: true },
    { column: 'created_at', ascending: false }
  );

  return (
    <div id="paginated-posts-section" className="p-4 space-y-4">
      <h2 className="text-xl font-bold">
        Posts - Page {page} of {totalPages || 1}
      </h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {data.map((post) => (
              <li key={post.id} className="py-2">
                {post.title}
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-3 pt-2">
            <button
              id="btn-prev-page"
              type="button"
              onClick={prevPage}
              disabled={!hasPrev}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages || 1}
            </span>
            <button
              id="btn-next-page"
              type="button"
              onClick={nextPage}
              disabled={!hasNext}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ============== File Upload Example ==============
export const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { upload, progress, uploading, error, results } = useFileUpload('avatars');

  const handleUpload = async () => {
    if (files.length === 0) return;
    await upload(files, 'users/avatars');
    setFiles([]);
  };

  return (
    <div id="file-uploader-section" className="p-4 space-y-4">
      <input
        id="file-upload-input"
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        id="btn-upload-files"
        type="button"
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>

      {Object.entries(progress).map(([name, prog]) => (
        <div key={name} className="flex items-center space-x-2 text-sm">
          <span>{name}</span>
          <progress value={prog} max="100" className="w-32" />
          <span>{prog}%</span>
        </div>
      ))}

      {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Uploaded Files:</h3>
          {results.map((result, index) => (
            <div key={index} className="flex items-center space-x-2">
              <img
                src={getOptimizedImageUrl('avatars', result.path, { width: 50, height: 50 })}
                alt="Uploaded"
                className="w-10 h-10 object-cover rounded"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-gray-600">{result.path}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============== Edge Function Example ==============
export const AIAssistant: React.FC = () => {
  const { data, loading, error, invoke } = useFunction<{ response: string }>('ai-generate');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    await invoke({ prompt });
  };

  return (
    <div id="ai-assistant-section" className="p-4 space-y-3">
      <textarea
        id="ai-prompt-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="w-full border border-gray-300 rounded-md p-2 text-sm"
        rows={3}
      />
      <button
        id="btn-invoke-ai"
        type="button"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <div className="text-red-600 text-sm">Error: {error.message}</div>}
      {data && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-semibold text-sm mb-1">AI Response:</h3>
          <p className="text-sm text-gray-800">{data.response}</p>
        </div>
      )}
    </div>
  );
};

// ============== Real-time Trigger Example ==============
export const NotificationListener: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useTrigger<{ message: string }>(
    'notifications',
    'INSERT',
    (payload) => {
      setNotifications((prev) => [...prev, `New notification: ${payload.message}`]);
    },
    true
  );

  return (
    <div id="notification-listener-section" className="p-4 space-y-2">
      <h2 className="font-bold text-lg">Real-time Notifications ({notifications.length})</h2>
      <ul className="space-y-1">
        {notifications.map((msg, i) => (
          <li key={i} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============== Profile Management Example ==============
export const ProfileManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await updateProfile({
      username: (formData.get('username') as string) || undefined,
      bio: (formData.get('bio') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      alert('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    const result = await resetPassword('user@example.com');
    if (result.error) {
      setError(result.error.message);
    } else {
      alert('Password reset email sent!');
    }
  };

  return (
    <div id="profile-manager-section" className="p-4 space-y-4">
      <form onSubmit={handleProfileUpdate} className="space-y-3">
        <div>
          <label htmlFor="input-profile-username" className="block text-xs font-semibold text-gray-700">Username</label>
          <input id="input-profile-username" name="username" placeholder="Username" className="w-full border p-2 text-sm rounded" />
        </div>
        <div>
          <label htmlFor="input-profile-bio" className="block text-xs font-semibold text-gray-700">Bio</label>
          <textarea id="input-profile-bio" name="bio" placeholder="Bio" className="w-full border p-2 text-sm rounded" />
        </div>
        <div>
          <label htmlFor="input-profile-website" className="block text-xs font-semibold text-gray-700">Website</label>
          <input id="input-profile-website" name="website" placeholder="Website" className="w-full border p-2 text-sm rounded" />
        </div>
        <button
          id="btn-update-profile"
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
      <button
        id="btn-reset-password"
        type="button"
        onClick={handlePasswordReset}
        className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
      >
        Reset Password
      </button>
    </div>
  );
};
