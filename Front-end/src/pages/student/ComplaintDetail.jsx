import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { MdArrowBack, MdEdit, MdDelete, MdStar, MdStarBorder } from 'react-icons/md';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${baseUrl}/${url.replace(/^\/+/, '')}`;
};

const TimelineItem = ({ item }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
      <div className="w-0.5 bg-[var(--bg-card-hover)] flex-1 mt-1" />
    </div>
    <div className="pb-4">
      <p className="text-sm font-medium text-content">{item.status?.replace(/_/g,' ')}</p>
      <p className="text-xs text-muted mt-0.5">{item.remark}</p>
      <p className="text-xs text-muted mt-1">
        {item.updatedBy?.name || 'System'} · {new Date(item.date || item.createdAt).toLocaleString()}
      </p>
    </div>
  </div>
);

export default function ComplaintDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [rating,    setRating]    = useState(0);
  const [feedback,  setFeedback]  = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    API.get(`/complaints/${id}`)
      .then(res => setComplaint(res.data.data))
      .catch(() => toast.error('Complaint not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    setDeleting(true);
    try {
      await API.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
    } finally { setDeleting(false); }
  };

  const handleRate = async () => {
    if (!rating) return toast.warning('Please select a rating');
    setRatingLoading(true);
    try {
      await API.post(`/complaints/${id}/rate`, { rating, feedback });
      toast.success('Thank you for your feedback!');
      setComplaint(prev => ({ ...prev, status: 'closed', rating, feedback }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rating failed');
    } finally { setRatingLoading(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-[var(--bg-card-hover)] rounded w-1/2" />
      <div className="card space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-[var(--bg-card-hover)] rounded" />)}
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="card text-center py-16">
      <p className="text-muted">Complaint not found.</p>
      <Link to="/my-complaints" className="btn-primary mt-4 inline-flex">Go Back</Link>
    </div>
  );

  const isPending = ['pending', 'Pending'].includes(complaint.status);
  const isResolved = ['resolved', 'Resolved'].includes(complaint.status);
  const isOwner = complaint.student?._id === user?._id || complaint.student === user?._id;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <MdArrowBack /> Back
      </button>

      {/* Header Card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-content flex-1">{complaint.title}</h1>
          <div className="flex gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge   status={complaint.status} />
          </div>
        </div>

        <p className="text-muted leading-relaxed">{complaint.description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
          {[
            { label: 'Category',   value: complaint.category?.name || '—' },
            { label: 'Department', value: complaint.department?.name || '—' },
            { label: 'Submitted',  value: new Date(complaint.createdAt).toLocaleDateString('en-IN') },
            { label: 'Anonymous',  value: complaint.isAnonymous ? 'Yes' : 'No' },
          ].map(m => (
            <div key={m.label}>
              <p className="text-xs text-muted">{m.label}</p>
              <p className="text-sm font-medium text-content mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Assigned To */}
        {complaint.assignedTo && (
          <div className="bg-[var(--bg-card-hover)]/50 rounded-xl p-3">
            <p className="text-xs text-muted mb-1">Assigned To</p>
            <p className="text-sm text-content font-medium">{complaint.assignedTo.name}</p>
            <p className="text-xs text-muted">{complaint.assignedTo.email}</p>
          </div>
        )}

        {/* Remarks */}
        {complaint.remarks && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-400 mb-1 font-semibold">Admin Remarks</p>
            <p className="text-sm text-muted">{complaint.remarks}</p>
          </div>
        )}

        {/* Attachments */}
        {complaint.attachments?.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {complaint.attachments.map((url, i) => (
                <a key={i} href={getImageUrl(url)} target="_blank" rel="noreferrer">
                  <img src={getImageUrl(url)} alt={`attachment-${i}`} className="w-20 h-20 object-cover rounded-lg border border-border hover:border-blue-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions (Student, Pending only) */}
        {isOwner && isPending && (
          <div className="flex gap-3 pt-2 border-t border-border">
            <Link to={`/complaint/${id}/edit`} className="btn-secondary flex-1 justify-center">
              <MdEdit /> Edit
            </Link>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
              <MdDelete /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      {complaint.statusHistory?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-content mb-4">Status Timeline</h2>
          <div>
            {complaint.statusHistory.map((item, i) => (
              <TimelineItem key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Rating (resolved + owner + not yet rated) */}
      {isOwner && isResolved && !complaint.rating && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-content">Rate Your Experience</h2>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-700 hover:text-amber-500'}`}>
                {star <= rating ? <MdStar /> : <MdStarBorder />}
              </button>
            ))}
          </div>
          <textarea rows={3} className="input resize-none" placeholder="Share your feedback (optional)..."
            value={feedback} onChange={e => setFeedback(e.target.value)} />
          <button onClick={handleRate} disabled={ratingLoading} className="btn-primary">
            {ratingLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}

      {/* Already Rated */}
      {complaint.rating && (
        <div className="card text-center">
          <p className="text-muted text-sm">You rated this complaint</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1,2,3,4,5].map(s => (
              <MdStar key={s} className={`text-2xl ${s <= complaint.rating ? 'text-amber-400' : 'text-slate-700'}`} />
            ))}
          </div>
          {complaint.feedback && <p className="text-muted text-sm mt-2 italic">"{complaint.feedback}"</p>}
        </div>
      )}
    </div>
  );
}
