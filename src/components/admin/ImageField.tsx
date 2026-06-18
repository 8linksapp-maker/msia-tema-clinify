import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

const labelClass = 'block text-xs font-bold text-adm-ink-muted uppercase tracking-wider mb-1.5 ml-0.5';
const inputClass = 'w-full bg-adm-surface border border-adm-border rounded-md px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-adm-primary/80 focus:ring-2 focus:ring-adm-primary/20 transition-all shadow-sm';

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// nome de arquivo seguro p/ URL (sem acento, espaços, etc.)
function safeName(name: string): string {
    const dot = name.lastIndexOf('.');
    const base = (dot >= 0 ? name.slice(0, dot) : name)
        .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'img';
    const ext = (dot >= 0 ? name.slice(dot + 1) : 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    return `${base}.${ext}`;
}

interface Props {
    label: string;
    value: string;
    onChange: (path: string) => void;
    placeholder?: string;
    /** Legenda com o tamanho/proporção recomendados (ex: "Recomendado: 1200×900px · proporção 4:3") */
    hint?: string;
}

/**
 * Campo de imagem: aceita o path digitado E upload de arquivo do PC.
 * No upload, grava em public/uploads/ via githubApi (base64) e seta o path resultante.
 */
export default function ImageField({ label, value, onChange, placeholder, hint }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState('');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setPreview(URL.createObjectURL(file)); // feedback visual imediato
        setUploading(true);
        triggerToast('Enviando imagem...', 'progress', 30);
        try {
            const content = await fileToBase64(file);
            const ghPath = `public/uploads/${Date.now()}-${safeName(file.name)}`;
            await githubApi('write', ghPath, { content, isBase64: true, message: `CMS: Upload ${ghPath}` });
            onChange(ghPath.replace('public', ''));
            triggerToast('Imagem enviada!', 'success', 100);
        } catch (err: any) {
            setPreview('');
            triggerToast(`Erro no upload: ${err.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const thumb = preview || value;

    return (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="flex gap-2 items-stretch">
                {thumb && (
                    <img src={thumb} alt="" className="w-12 h-12 rounded-md object-cover border border-adm-border shrink-0 bg-adm-elev" />
                )}
                <input
                    type="text"
                    value={value}
                    onChange={e => { setPreview(''); onChange(e.target.value); }}
                    className={`${inputClass} flex-1`}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    title="Enviar imagem do computador"
                    aria-label={`Enviar imagem do computador para ${label}`}
                    className="shrink-0 px-3 rounded-md border border-adm-border bg-adm-elev text-adm-ink-muted hover:text-adm-primary hover:border-adm-primary disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold transition-all"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Upload className="w-4 h-4" aria-hidden="true" />}
                    <span className="hidden sm:inline">{uploading ? 'Enviando' : 'Upload'}</span>
                </button>
            </div>
            {hint && <p className="text-[10px] text-adm-ink-faint mt-1.5 ml-0.5">{hint}</p>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}
