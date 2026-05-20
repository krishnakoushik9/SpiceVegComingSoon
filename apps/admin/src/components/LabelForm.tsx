import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SeedLabel, SeedLabelSchema } from '@spiceveg/types';
import { Loader2, Check } from 'lucide-react';

interface LabelFormProps {
  onSubmit: (data: SeedLabel) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<SeedLabel>;
}

const COMPANY_DEFAULTS = {
  producedBy: 'Spice Veg Agri, Hyderabad',
  packedBy:   'Spice Veg Agri, Hyderabad',
  marketedBy: 'Spice Veg Agri Pvt. Ltd., Hyderabad',
};

export const LabelForm: React.FC<LabelFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SeedLabel>({
    resolver: zodResolver(SeedLabelSchema),
    defaultValues: { ...COMPANY_DEFAULTS, ...(initialData as SeedLabel) },
  });

  const fieldError = (key: keyof SeedLabel) =>
    errors[key] ? <p className="text-red-500 text-[11px] mt-1">{errors[key]?.message as string}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      {/* Lot Identity */}
      <div className="form-section">
        <div className="form-section-head">
          <span className="dot" />
          <h3>Lot Identity</h3>
          <span className="meta">Required</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Crop</label>
            <input {...register('crop')} placeholder="e.g. Chilli" className="input-field" />
            {fieldError('crop')}
          </div>
          <div>
            <label className="field-label">Variety</label>
            <input {...register('variety')} placeholder="e.g. SPICE-55" className="input-field" />
            {fieldError('variety')}
          </div>
        </div>

        <div className="mt-3">
          <label className="field-label">Lot Number</label>
          <input {...register('lotNo')} placeholder="e.g. SV22162" className="input-field" />
          {fieldError('lotNo')}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="field-label">Date of Testing</label>
            <input type="date" {...register('dot')} className="input-field" />
            {fieldError('dot')}
          </div>
          <div>
            <label className="field-label">Date of Packaging</label>
            <input type="date" {...register('dop')} className="input-field" />
            {fieldError('dop')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="field-label">Valid Upto</label>
            <input type="date" {...register('validUpto')} className="input-field" />
            {fieldError('validUpto')}
          </div>
          <div>
            <label className="field-label">Net Weight</label>
            <input {...register('netWeight')} placeholder="e.g. 10g" className="input-field" />
            {fieldError('netWeight')}
          </div>
        </div>

        <div className="mt-3">
          <label className="field-label">MRP (₹)</label>
          <input type="number" {...register('mrp')} placeholder="e.g. 815" className="input-field" />
          {fieldError('mrp')}
        </div>
      </div>

      {/* Quality Parameters */}
      <div className="form-section">
        <div className="form-section-head">
          <span className="dot" style={{ background: '#C0DD97' }} />
          <h3>Quality Parameters</h3>
          <span className="meta">Optional</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Physical Purity</label>
            <input {...register('physicalPurity' as any)} placeholder="e.g. 98%" className="input-field" />
          </div>
          <div>
            <label className="field-label">Genetic Purity</label>
            <input {...register('geneticPurity' as any)} placeholder="e.g. 95%" className="input-field" />
          </div>
          <div>
            <label className="field-label">Germination</label>
            <input {...register('germination' as any)} placeholder="e.g. 60%" className="input-field" />
          </div>
          <div>
            <label className="field-label">Moisture</label>
            <input {...register('moisture' as any)} placeholder="e.g. 6%" className="input-field" />
          </div>
        </div>
      </div>

      {/* Producer Details */}
      <div className="form-section">
        <div className="form-section-head">
          <span className="dot" style={{ background: '#7A8F6A' }} />
          <h3>Producer Details</h3>
          <span className="meta">Defaults loaded</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="field-label">Produced By</label>
            <input {...register('producedBy' as any)} className="input-field" />
          </div>
          <div>
            <label className="field-label">Packed By</label>
            <input {...register('packedBy' as any)} className="input-field" />
          </div>
          <div>
            <label className="field-label">Marketed By</label>
            <input {...register('marketedBy' as any)} className="input-field" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full mt-4"
      >
        {isLoading
          ? <Loader2 className="animate-spin" size={18} />
          : <Check size={18} strokeWidth={2.5} />}
        {initialData ? 'Update Label' : 'Generate & Save Label'}
      </button>
    </form>
  );
};
