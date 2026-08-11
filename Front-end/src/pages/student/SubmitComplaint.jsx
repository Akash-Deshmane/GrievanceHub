import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { MdUpload, MdClose, MdSend } from 'react-icons/md';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [categories,   setCategories]   = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [previews,     setPreviews]     = useState([]);
  const [files,        setFiles]        = useState([]);
  const [submitting,   setSubmitting]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { isAnonymous: 'false' },
  });

  useEffect(() => {
    Promise.all([
      API.get('/categories'),
      API.get('/departments'),
    ]).then(([catRes, deptRes]) => {
      setCategories(catRes.data.categories || []);
      setDepartments(deptRes.data.departments || []);
    }).catch(() => {});
  }, []);

  const handleFiles = (e) => {
    const selected = [...e.target.files].slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const removeFile = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => form.append(k, v));
      files.forEach(f => form.append('images', f));

      await API.post('/complaints', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Complaint submitted successfully!');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title mb-1">Submit a Complaint</h1>
        <p className="text-muted text-sm">Fill in the details of your grievance. All fields marked * are required.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        {/* Title */}
        <div>
          <label className="label">Complaint Title *</label>
          <input className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Brief title of your complaint"
            {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })} />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea rows={5} className={`input resize-none ${errors.description ? 'input-error' : ''}`}
            placeholder="Describe your issue in detail..."
            {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })} />
          {errors.description && <p className="error-text">{errors.description.message}</p>}
        </div>

        {/* Category + Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className={`select ${errors.category ? 'input-error' : ''}`}
              {...register('category', { required: 'Category required' })}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.category && <p className="error-text">{errors.category.message}</p>}
          </div>
          <div>
            <label className="label">Department *</label>
            <select className={`select ${errors.department ? 'input-error' : ''}`}
              {...register('department', { required: 'Department required' })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            {errors.department && <p className="error-text">{errors.department.message}</p>}
          </div>
        </div>

        {/* Anonymous Submission */}
        <div>
          <label className="label">Anonymous Submission</label>
          <select className="select" {...register('isAnonymous')}>
            <option value="false">No — show my name</option>
            <option value="true">Yes — hide my identity</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="label">Attach Images (optional, max 5)</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-200">
            <MdUpload className="text-4xl text-muted mb-2" />
            <span className="text-sm text-muted">Click to upload images</span>
            <span className="text-xs text-muted mt-1">JPG, PNG, WEBP · max 5MB each</span>
            <input type="file" className="hidden" multiple accept="image/*" onChange={handleFiles} />
          </label>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {previews.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.url} alt={p.name} className="w-20 h-20 object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <MdClose />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
            {submitting ? 'Submitting...' : <><MdSend /> Submit Complaint</>}
          </button>
        </div>
      </form>
    </div>
  );
}
