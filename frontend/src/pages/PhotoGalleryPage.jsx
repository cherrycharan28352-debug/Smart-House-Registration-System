import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Filter, Home, Calendar, RefreshCw, Eye } from 'lucide-react';
import { getAllPhotos } from '../services/houseService';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

const PhotoGalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const toast = useToast();

  const categories = ['Front view', 'Exterior', 'Interior', 'Other'];

  const fetchPhotos = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllPhotos({
        page,
        limit: 12,
        category
      });
      setPhotos(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load gallery photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(1);
  }, [category]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            House Photographic Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual archive of front views, exteriors, interior layouts, and on-site property imagery.
          </p>
        </div>

        <button
          onClick={() => fetchPhotos(pagination.page)}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            category === ''
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories ({pagination.total})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              category === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <LoadingSpinner message="Loading imagery archive..." />
      ) : photos.length === 0 ? (
        <EmptyState
          title="No photographs found"
          description="There are currently no photos uploaded under this category."
          actionLabel="Register a House with Photos"
          actionLink="/register-house"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {photos.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div
                onClick={() => setSelectedPhoto(p)}
                className="cursor-pointer relative aspect-[4/3] bg-slate-100 overflow-hidden"
              >
                <img
                  src={`/${p.filePath}`}
                  alt={p.category}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x300?text=House+Photo';
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white shadow-sm">
                  {p.category}
                </span>

                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="p-2 rounded-full bg-white text-slate-900 shadow-md">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    {p.house ? (
                      <Link
                        to={`/houses/${p.house.houseId || p.house._id}`}
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center truncate"
                      >
                        <Home className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        {p.house.houseId}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">Unlinked</span>
                    )}

                    <span className="text-[10px] text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {p.house && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {p.house.locality}, {p.house.city}
                    </p>
                  )}
                </div>

                {p.caption && (
                  <p className="text-[11px] text-slate-600 italic truncate" title={p.caption}>
                    "{p.caption}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(p) => fetchPhotos(p)}
      />

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.category || 'House Photograph'}
        subtitle={`Captured on ${selectedPhoto ? new Date(selectedPhoto.createdAt).toLocaleDateString() : ''}`}
        maxWidth="max-w-3xl"
      >
        {selectedPhoto && (
          <div className="space-y-3">
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
              <img
                src={`/${selectedPhoto.filePath}`}
                alt={selectedPhoto.category}
                className="max-h-[60vh] w-auto object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=House+Image';
                }}
              />
            </div>
            {selectedPhoto.caption && (
              <p className="text-xs text-slate-600 font-medium italic text-center">
                "{selectedPhoto.caption}"
              </p>
            )}
            {selectedPhoto.house && (
              <div className="text-center pt-2 border-t">
                <Link
                  to={`/houses/${selectedPhoto.house.houseId || selectedPhoto.house._id}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Full House Dossier &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoGalleryPage;
