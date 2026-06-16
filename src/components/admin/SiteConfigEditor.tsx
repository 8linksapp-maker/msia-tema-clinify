import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

interface SiteConfig {
    name: string;
    description: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    social: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
    };
}

const DEFAULT: SiteConfig = {
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    hours: '',
    social: { instagram: '', facebook: '', youtube: '' },
};

export default function SiteConfigEditor() {
    const [data, setData] = useState<SiteConfig>(DEFAULT);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        githubApi('read', 'src/data/siteConfig.json')
            .then(res => {
                setData(JSON.parse(res?.content || '{}'));
                setFileSha(res.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const set = (field: keyof SiteConfig, value: string) =>
        setData(prev => ({ ...prev, [field]: value }));

    const setSocial = (key: 'instagram' | 'facebook' | 'youtube', value: string) =>
        setData(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando dados da clínica...', 'progress', 20);
        try {
            const res = await githubApi('write', 'src/data/siteConfig.json', {
                content: JSON.stringify(data, null, 2),
                sha: fileSha,
                message: 'CMS: Update siteConfig.json',
            });
            setFileSha(res.sha);
            triggerToast('Dados salvos com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-adm-ink-faint bg-adm-surface rounded-lg border border-adm-border">
            <Building2 className="w-10 h-10 animate-pulse mb-6 text-adm-ink-faint" />
            <p className="font-semibold text-sm animate-pulse text-adm-ink-muted">Buscando siteConfig.json...</p>
        </div>
    );

    const cardClass = 'p-6 mb-6 bg-adm-surface border border-adm-border rounded-lg shadow-sm';
    const inputClass = 'w-full bg-adm-surface border border-adm-border rounded-md px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-adm-primary/80 focus:ring-2 focus:ring-adm-primary/20 transition-all shadow-sm';
    const labelClass = 'block text-sm font-bold text-adm-ink-muted uppercase tracking-wider mb-2 ml-1';

    return (
        <form onSubmit={handleSave} className="max-w-3xl pb-32">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-adm-surface p-4 px-6 rounded-lg border border-adm-border shadow-sm mb-6">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">Dados da clínica</h2>
                    <p className="text-xs text-adm-ink-muted mt-0.5">
                        Edita <code className="bg-adm-elev px-1 rounded">src/data/siteConfig.json</code>
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-adm-primary hover:brightness-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex gap-3 mb-6 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
            )}

            {/* Identidade */}
            <div className={cardClass}>
                <h3 className="text-base font-bold text-adm-ink mb-5 border-b border-adm-border pb-3">Identidade</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Nome da clínica</label>
                        <input type="text" value={data.name} onChange={e => set('name', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Descrição / Tagline</label>
                        <textarea rows={2} value={data.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-y`} />
                    </div>
                </div>
            </div>

            {/* Contato */}
            <div className={cardClass}>
                <h3 className="text-base font-bold text-adm-ink mb-5 border-b border-adm-border pb-3">Contato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Telefone</label>
                        <input type="text" value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 4002-8922" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>WhatsApp (número completo)</label>
                        <input type="text" value={data.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="5511940028922" className={inputClass} />
                        <p className="text-[11px] text-adm-ink-faint mt-1 ml-1">Formato: DDI + DDD + número, sem espaços</p>
                    </div>
                    <div>
                        <label className={labelClass}>E-mail</label>
                        <input type="email" value={data.email} onChange={e => set('email', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Horário de funcionamento</label>
                        <input type="text" value={data.hours} onChange={e => set('hours', e.target.value)} placeholder="Seg a Sáb, 9h às 19h" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Endereço</label>
                        <input type="text" value={data.address} onChange={e => set('address', e.target.value)} placeholder="Av. Paulista, 1000 — São Paulo, SP" className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Redes sociais */}
            <div className={cardClass}>
                <h3 className="text-base font-bold text-adm-ink mb-5 border-b border-adm-border pb-3">Redes sociais</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Instagram (URL ou #)</label>
                        <input type="text" value={data.social?.instagram || ''} onChange={e => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/clinicasorriso" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Facebook (URL ou #)</label>
                        <input type="text" value={data.social?.facebook || ''} onChange={e => setSocial('facebook', e.target.value)} placeholder="https://facebook.com/clinicasorriso" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>YouTube (URL ou #)</label>
                        <input type="text" value={data.social?.youtube || ''} onChange={e => setSocial('youtube', e.target.value)} placeholder="https://youtube.com/@clinicasorriso" className={inputClass} />
                    </div>
                </div>
            </div>
        </form>
    );
}
