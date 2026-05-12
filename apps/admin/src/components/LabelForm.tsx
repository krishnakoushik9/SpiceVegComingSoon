import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SeedLabel, SeedLabelSchema } from '@spiceveg/types';
import { Loader2, Plus, Printer, QrCode } from 'lucide-react';

interface LabelFormProps {
  onSubmit: (data: SeedLabel) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<SeedLabel>;
}

export const LabelForm: React.FC<LabelFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SeedLabel>({
    resolver: zodResolver(SeedLabelSchema),
    defaultValues: initialData as SeedLabel,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Crop</label>
          <input {...register('crop')} placeholder="e.g. Chilli" className="input-field" />
          {errors.crop && <p className="text-red-500 text-xs mt-1">{errors.crop.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Variety</label>
          <input {...register('variety')} placeholder="e.g. SPICE-55" className="input-field" />
          {errors.variety && <p className="text-red-500 text-xs mt-1">{errors.variety.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-stone-600 mb-1 block">Lot Number</label>
        <input {...register('lotNo')} placeholder="e.g. SV22162" className="input-field" />
        {errors.lotNo && <p className="text-red-500 text-xs mt-1">{errors.lotNo.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Testing Date</label>
          <input type="date" {...register('dot')} className="input-field" />
          {errors.dot && <p className="text-red-500 text-xs mt-1">{errors.dot.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Packaging Date</label>
          <input type="date" {...register('dop')} className="input-field" />
          {errors.dop && <p className="text-red-500 text-xs mt-1">{errors.dop.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Valid Upto</label>
          <input type="date" {...register('validUpto')} className="input-field" />
          {errors.validUpto && <p className="text-red-500 text-xs mt-1">{errors.validUpto.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-600 mb-1 block">Net Weight</label>
          <input {...register('netWeight')} placeholder="e.g. 10g" className="input-field" />
          {errors.netWeight && <p className="text-red-500 text-xs mt-1">{errors.netWeight.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-stone-600 mb-1 block">MRP (₹)</label>
        <input type="number" {...register('mrp')} placeholder="e.g. 815" className="input-field" />
        {errors.mrp && <p className="text-red-500 text-xs mt-1">{errors.mrp.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
        {initialData ? 'Update Label' : 'Generate & Save Label'}
      </button>
    </form>
  );
};
