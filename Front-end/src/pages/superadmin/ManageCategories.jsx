import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Modal = ({ title, defaultValues, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  const [saving, setSaving] = useState(false);
  const onSubmit = async (data) => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="font-bold text-content text-lg mb-4">{title}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Name required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" {...register('description')} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'create' | category object

  const fetchCategories = () => {
    setLoading(true);
    API.get('/categories').then(res => setCategories(res.data.categories || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (data) => {
    try {
      if (modal === 'create') {
        await API.post('/categories', data);
        toast.success('Category created!');
      } else {
        await API.put(`/categories/${modal._id}`, data);
        toast.success('Category updated!');
      }
      fetchCategories();
      setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {modal && (
        <Modal
          title={modal === 'create' ? 'Create Category' : 'Edit Category'}
          defaultValues={modal === 'create' ? {} : { name: modal.name, description: modal.description }}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="page-title mb-0">Manage Categories</h1>
        <button onClick={() => setModal('create')} className="btn-primary"><MdAdd /> Add Category</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-16 text-muted">No categories yet. Create the first one!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card group hover:border-border transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl mb-3">
                  {cat.icon || '📋'}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(cat)} className="p-1.5 text-muted hover:text-blue-400 transition-colors"><MdEdit /></button>
                  <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-muted hover:text-red-400 transition-colors"><MdDelete /></button>
                </div>
              </div>
              <h3 className="font-semibold text-content">{cat.name}</h3>
              {cat.description && <p className="text-xs text-muted mt-1 line-clamp-2">{cat.description}</p>}
              <div className="mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive !== false ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-muted'}`}>
                  {cat.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
