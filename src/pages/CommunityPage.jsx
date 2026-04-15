import React, { useEffect, useMemo, useState } from 'react';
import {
  createDiscussionComment,
  createDiscussionThread,
  createFollow,
  createLftPost,
  fetchDiscussionThread,
  fetchDiscussionThreads,
  fetchFollows,
  fetchLftPosts,
  fetchMyProfile,
  fetchPublicProfiles,
  updateFollow,
  updateLftPost,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function CommunityPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [social, setSocial] = useState({ friends: [], pending_requests: [] });
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [lftPosts, setLftPosts] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [threadForm, setThreadForm] = useState({ title: '', body: '' });
  const [commentBody, setCommentBody] = useState('');
  const [lftForm, setLftForm] = useState({ game_title: 'CODM', role_needed: '', rank_requirement: '', region: 'Kenya', slots_open: 1, notes: '' });

  const loadCommunity = async () => {
    const [publicProfiles, threadList, lftList] = await Promise.all([
      fetchPublicProfiles(),
      fetchDiscussionThreads(),
      fetchLftPosts(),
    ]);
    setProfiles(Array.isArray(publicProfiles) ? publicProfiles : []);
    setThreads(Array.isArray(threadList) ? threadList : []);
    setLftPosts(Array.isArray(lftList) ? lftList : []);
  };

  useEffect(() => {
    loadCommunity().catch(() => setError('Unable to load community data'));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    fetchMyProfile(user.id)
      .then((data) => setProfile(data))
      .catch(() => setError('Unable to load profile stats'));

    fetchFollows()
      .then((data) => setSocial(data || { friends: [], pending_requests: [] }))
      .catch(() => setError('Unable to load social data'));
  }, [user]);

  const activeThreadComments = useMemo(() => activeThread?.comments || [], [activeThread]);

  const followUser = async (userId) => {
    if (!user) return;
    try {
      await createFollow(userId);
      setStatus('Follow request sent');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to follow user');
    }
  };

  const acceptFollow = async (followId) => {
    try {
      await updateFollow(followId, 'accepted');
      const data = await fetchFollows();
      setSocial(data || { friends: [], pending_requests: [] });
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to accept follow request');
    }
  };

  const openThread = async (threadId) => {
    try {
      const data = await fetchDiscussionThread(threadId);
      setActiveThread(data);
    } catch (err) {
      setError('Unable to open thread');
    }
  };

  const submitThread = async (event) => {
    event.preventDefault();
    try {
      await createDiscussionThread(threadForm);
      setThreadForm({ title: '', body: '' });
      setStatus('Discussion thread created');
      await loadCommunity();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create thread');
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!activeThread?.id) return;
    try {
      await createDiscussionComment(activeThread.id, commentBody);
      setCommentBody('');
      await openThread(activeThread.id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to comment');
    }
  };

  const submitLft = async (event) => {
    event.preventDefault();
    try {
      await createLftPost(lftForm);
      setLftForm({ game_title: 'CODM', role_needed: '', rank_requirement: '', region: 'Kenya', slots_open: 1, notes: '' });
      setStatus('LFT post published');
      await loadCommunity();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to create LFT post');
    }
  };

  const closeMyLft = async (postId) => {
    try {
      await updateLftPost(postId, { status: 'closed' });
      await loadCommunity();
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to close LFT post');
    }
  };

  return (
    <main className="container-12 section-block community-page">
      <h2>Community Hub</h2>
      {status ? <p className="section-status">{status}</p> : null}
      {error ? <p className="section-status section-status-error">{error}</p> : null}

      <section className="community-grid">
        <article className="glass-card community-card">
          <h3>Your Profile</h3>
          {profile ? (
            <>
              <p><strong>{profile.username}</strong></p>
              <p>Followers: {profile.stats?.followers || 0}</p>
              <p>Following: {profile.stats?.following || 0}</p>
              <p>Tournaments: {profile.stats?.tournaments_joined || 0}</p>
              <p>Matches won: {profile.stats?.matches_won || 0}</p>
              <p>CODM: {profile.stats?.codm_rank || '-'} | {profile.stats?.codm_kills || 0} kills</p>
            </>
          ) : <p>Log in to see profile stats.</p>}
        </article>

        <article className="glass-card community-card">
          <h3>Friends & Follow</h3>
          <p className="section-status">Friends: {(social.friends || []).length}</p>
          <div className="community-list">
            {(social.pending_requests || []).map((request) => (
              <div key={request.id} className="community-list-item">
                <span>{request.follower?.username}</span>
                <button type="button" className="btn btn-sm btn-warning" onClick={() => acceptFollow(request.id)}>Accept</button>
              </div>
            ))}
          </div>
          <h4 className="mt-2">Discover Players</h4>
          <div className="community-list">
            {profiles.filter((item) => item.id !== user?.id).slice(0, 6).map((item) => (
              <div key={item.id} className="community-list-item">
                <span>{item.username}</span>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => followUser(item.id)}>Follow</button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="community-grid mt-3">
        <article className="glass-card community-card">
          <h3>Discussion Threads</h3>
          {user ? (
            <form className="community-form" onSubmit={submitThread}>
              <input placeholder="Thread title" value={threadForm.title} onChange={(e) => setThreadForm((p) => ({ ...p, title: e.target.value }))} required />
              <textarea rows={3} placeholder="Start the discussion" value={threadForm.body} onChange={(e) => setThreadForm((p) => ({ ...p, body: e.target.value }))} required />
              <button type="submit" className="btn btn-primary btn-sm">Post Thread</button>
            </form>
          ) : null}

          <div className="community-list mt-2">
            {threads.slice(0, 8).map((thread) => (
              <button key={thread.id} type="button" className="community-thread-button" onClick={() => openThread(thread.id)}>
                <strong>{thread.title}</strong>
                <small>by {thread.author?.username} | {thread.comments_count} comments</small>
              </button>
            ))}
          </div>
        </article>

        <article className="glass-card community-card">
          <h3>Thread View</h3>
          {activeThread ? (
            <>
              <h4>{activeThread.title}</h4>
              <p>{activeThread.body}</p>
              <div className="community-list">
                {activeThreadComments.map((comment) => (
                  <div key={comment.id} className="community-comment-item">
                    <small>{comment.author?.username}</small>
                    <p>{comment.body}</p>
                  </div>
                ))}
              </div>
              {user ? (
                <form className="community-form" onSubmit={submitComment}>
                  <textarea rows={2} placeholder="Write a comment" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} required />
                  <button type="submit" className="btn btn-outline-light btn-sm">Reply</button>
                </form>
              ) : null}
            </>
          ) : <p>Select a thread to view and reply.</p>}
        </article>
      </section>

      <section className="community-grid mt-3">
        <article className="glass-card community-card">
          <h3>Looking For Team (LFT)</h3>
          {user ? (
            <form className="community-form" onSubmit={submitLft}>
              <input value={lftForm.game_title} onChange={(e) => setLftForm((p) => ({ ...p, game_title: e.target.value }))} placeholder="Game" required />
              <input value={lftForm.role_needed} onChange={(e) => setLftForm((p) => ({ ...p, role_needed: e.target.value }))} placeholder="Role needed" required />
              <input value={lftForm.rank_requirement} onChange={(e) => setLftForm((p) => ({ ...p, rank_requirement: e.target.value }))} placeholder="Rank requirement" />
              <input value={lftForm.region} onChange={(e) => setLftForm((p) => ({ ...p, region: e.target.value }))} placeholder="Region" />
              <input type="number" min="1" value={lftForm.slots_open} onChange={(e) => setLftForm((p) => ({ ...p, slots_open: Number(e.target.value) }))} placeholder="Slots" />
              <textarea rows={2} value={lftForm.notes} onChange={(e) => setLftForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" />
              <button type="submit" className="btn btn-primary btn-sm">Post LFT</button>
            </form>
          ) : null}
        </article>

        <article className="glass-card community-card">
          <h3>Open LFT Posts</h3>
          <div className="community-list">
            {lftPosts.map((post) => (
              <div key={post.id} className="community-comment-item">
                <p><strong>{post.author?.username}</strong> needs {post.role_needed} ({post.game_title})</p>
                <p>Rank: {post.rank_requirement || '-'} | Region: {post.region || '-'} | Slots: {post.slots_open}</p>
                <p>Status: {post.status}</p>
                {user?.id === post.user_id && post.status === 'open' ? (
                  <button type="button" className="btn btn-sm btn-warning" onClick={() => closeMyLft(post.id)}>Mark Closed</button>
                ) : null}
              </div>
            ))}
            {lftPosts.length === 0 ? <p>No LFT posts yet.</p> : null}
          </div>
        </article>
      </section>
    </main>
  );
}

export default CommunityPage;
