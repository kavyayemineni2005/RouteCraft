import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  Sparkles,
  ExternalLink,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { getReviewsByPlaceApi, createReviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlaceModal = ({ place, isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && place) {
      fetchReviews();
      setSubmitSuccess(false);
      setErrorMsg('');
      setNewComment('');
    }
  }, [isOpen, place]);

  const fetchReviews = async () => {
    if (!place?._id && !place?.name) return;
    setLoadingReviews(true);
    try {
      if (place._id) {
        const res = await getReviewsByPlaceApi(place._id);
        setReviews(res.data || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.warn('Could not fetch reviews:', err.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setErrorMsg('Please enter your review comment.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (place._id) {
        const res = await createReviewApi({
          placeId: place._id,
          rating: newRating,
          comment: newComment.trim(),
        });
        setReviews((prev) => [res.data, ...prev]);
      } else {
        // Optimistic local review for non-persisted seed place
        const dummyReview = {
          _id: Date.now().toString(),
          rating: newRating,
          comment: newComment.trim(),
          userName: user?.name || 'Fellow Road Tripper',
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [dummyReview, ...prev]);
      }

      setSubmitSuccess(true);
      setNewComment('');
      setTimeout(() => setSubmitSuccess(false), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-black">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-zinc-900 text-amber-300 border border-zinc-700">
                {place.category || 'Pitstop'}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating ? place.rating.toFixed(1) : '4.5'}</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {place.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Description & Metrics */}
          <div className="bg-black p-4 rounded-2xl border border-zinc-800">
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              {place.description || 'A handpicked pitstop ideal for scenic views, refreshment, or local cultural experience along your route.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 block mb-0.5">Recommended Stay</span>
                <strong className="text-zinc-200 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {place.stopDurationMinutes || 30} mins
                </strong>
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 block mb-0.5">Coordinates</span>
                <strong className="text-zinc-200 font-semibold truncate block">
                  {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                </strong>
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-zinc-400 block mb-0.5">Corridor Route</span>
                <strong className="text-emerald-400 font-semibold">Verified Safe Stop</strong>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Traveler Reviews ({reviews.length})
              </h4>
            </div>

            {loadingReviews ? (
              <div className="text-center py-6 text-zinc-400 text-sm">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading traveler reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 px-4 bg-black rounded-2xl border border-dashed border-zinc-800 text-zinc-400 text-sm">
                No reviews yet. Be the first explorer to leave a review!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div 
                    key={rev._id || rev.createdAt} 
                    className="p-3.5 rounded-xl bg-black border border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                          {(rev.userName || rev.user?.name || 'T')[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-zinc-200">
                          {rev.userName || rev.user?.name || 'Road Tripper'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 pl-8 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Box */}
          <div className="bg-black p-4 rounded-2xl border border-zinc-800">
            <h5 className="text-sm font-bold text-white mb-2">
              Share Your Experience
            </h5>

            {submitSuccess && (
              <div className="p-3 mb-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Thank you! Your review has been posted.
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              {/* Star Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-400 ml-1">
                  {newRating} / 5
                </span>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was the view, food quality, or restroom cleanliness?"
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Posting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceModal;
