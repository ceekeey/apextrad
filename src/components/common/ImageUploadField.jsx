import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus } from 'lucide-react';

import { resolveImageUrl } from '../../utils/trading';

export default function ImageUploadField({ label, value, onChange, onRemove }) {
    const previewUrl = useMemo(() => {
        if (!value) return null;
        if (typeof value === 'string') return resolveImageUrl(value);
        if (value instanceof File) return URL.createObjectURL(value);
        return null;
    }, [value]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles[0]) onChange(acceptedFiles[0]);
        },
    });

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
                <span>{label}</span>
                {value && <button type="button" onClick={onRemove} className="text-xs text-red-300">Remove</button>}
            </div>

            <div {...getRootProps()} className={`flex min-h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed p-3 text-center transition ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-950/60'}`}>
                <input {...getInputProps()} />
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className="h-28 w-full rounded-lg object-cover" />
                ) : (
                    <div className="text-sm text-slate-400">
                        <ImagePlus className="mx-auto mb-2 h-6 w-6 text-blue-300" />
                        Drop image here
                    </div>
                )}
            </div>
        </div>
    );
}
