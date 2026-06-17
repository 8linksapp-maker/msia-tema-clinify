import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Plus, Trash2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

interface FaqItem {
    q: string;
    a: string;
}

interface LocalItem {
    slug: string;
    nome: string;
    prep: string;
    regiao: string;
    bairrosVizinhos: string[];
    referenciaLocal: string;
    faq: FaqItem[];
}

const EMPTY_LOCAL: LocalItem = {
    slug: '',
    nome: '',
    prep: 'em',
    regiao: '',
    bairrosVizinhos: [],
    referenciaLocal: '',
    faq: [],
};

const EMPTY_FAQ: FaqItem = { q: '', a: '' };

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function LocaisEditor() {
    const [items, setItems] = useState<LocalItem[]>([]);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    useEffect(() => {
        githubApi('read', 'src/data/locais.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || '[]');
                setItems(Array.isArray(parsed) ? parsed : []);
                setFileSha(data.sha);
            })
            .catch(err => {
                if (err.message.includes('404')) setItems([]);
                else setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando localidades...', 'progress', 30);
        try {
            const res = await githubApi('write', 'src/data/locais.json', {
                content: JSON.stringify(items, null, 2),
                sha: fileSha || undefined,
                message: 'CMS: Update locais.json',
            });
            setFileSha(res.sha);
            triggerToast('Localidades salvas com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro ao salvar: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        const newIdx = items.length;
        setItems([...items, { ...EMPTY_LOCAL, faq: [], bairrosVizinhos: [] }]);
        setExpandedIdx(newIdx);
    };

    const removeItem = (idx: number) => {
        if (!confirm('Excluir esta localidade?')) return;
        setItems(items.filter((_, i) => i !== idx));
        if (expandedIdx === idx) setExpandedIdx(null);
        else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
    };

    const updateField = <K extends keyof LocalItem>(idx: number, field: K, value: LocalItem[K]) => {
        setItems(items.map((it, i) => {
            if (i !== idx) return it;
            const updated = { ...it, [field]: value };
            if (field === 'nome') {
                const autoSlug = toSlug(it.nome);
                const nome = value as string;
                if (it.slug === '' || it.slug === autoSlug) {
                    (updated as LocalItem).slug = toSlug(nome);
                }
            }
            return updated;
        }));
    };

    const updateSlugDirect = (idx: number, value: string) => {
        const safe = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        setItems(items.map((it, i) => i === idx ? { ...it, slug: safe } : it));
    };

    // Bairros vizinhos helpers
    const addBairro = (idx: number) => {
        const item = items[idx];
        updateField(idx, 'bairrosVizinhos', [...item.bairrosVizinhos, '']);
    };

    const updateBairro = (localIdx: number, bairroIdx: number, value: string) => {
        const updated = [...items[localIdx].bairrosVizinhos];
        updated[bairroIdx] = value;
        updateField(localIdx, 'bairrosVizinhos', updated);
    };

    const removeBairro = (localIdx: number, bairroIdx: number) => {
        const updated = items[localIdx].bairrosVizinhos.filter((_, i) => i !== bairroIdx);
        updateField(localIdx, 'bairrosVizinhos', updated);
    };

    // FAQ helpers
    const addFaq = (idx: number) => {
        const item = items[idx];
        updateField(idx, 'faq', [...item.faq, { ...EMPTY_FAQ }]);
    };

    const updateFaq = (localIdx: number, faqIdx: number, field: keyof FaqItem, value: string) => {
        const updated = items[localIdx].faq.map((f, i) =>
            i === faqIdx ? { ...f, [field]: value } : f
        );
        updateField(localIdx, 'faq', updated);
    };

    const removeFaq = (localIdx: number, faqIdx: number) => {
        const updated = items[localIdx].faq.filter((_, i) => i !== faqIdx);
        updateField(localIdx, 'faq', updated);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-adm-ink-faint bg-adm-surface rounded-lg border border-adm-border">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-adm-primary" aria-hidden="true" />
            <p className="font-medium animate-pulse">Carregando localidades...</p>
        </div>
    );

    const inputClass = "w-full bg-adm-elev border border-adm-border rounded-md px-4 py-3 text-sm text-adm-ink font-medium focus:outline-none focus:border-adm-primary focus:ring-2 focus:ring-adm-primary/20 transition-all";
    const labelClass = "block text-[10px] font-bold text-adm-ink-muted uppercase tracking-widest mb-1.5";
    const subInputClass = "flex-1 bg-adm-elev border border-adm-border rounded-md px-3 py-2.5 text-sm text-adm-ink font-medium focus:outline-none focus:border-adm-primary focus:ring-2 focus:ring-adm-primary/20 transition-all";

    return (
        <form onSubmit={handleSave} className="space-y-6 pb-32 max-w-3xl">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-adm-surface/80 backdrop-blur-xl p-5 px-6 rounded-lg border border-adm-border shadow-xl shadow-slate-200/50 sticky top-0 z-40">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">Localidades</h2>
                    <p className="text-xs font-bold text-adm-ink-muted uppercase tracking-widest mt-1">
                        {items.length} localidade{items.length !== 1 ? 's' : ''} &middot; <code className="font-mono normal-case tracking-normal text-adm-ink-faint">src/data/locais.json</code>
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-adm-primary hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-adm-surface px-6 py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {error && (
                <div role="alert" className="p-5 bg-red-100/50 text-red-700 rounded-lg font-bold border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" /> {error}
                </div>
            )}

            {/* Items */}
            <div className="space-y-4" aria-label="Lista de localidades">
                {items.length === 0 ? (
                    <div className="bg-adm-elev border-2 border-dashed border-adm-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
                        <MapPin className="w-12 h-12 text-adm-ink-faint mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-bold text-adm-ink mb-2">Nenhuma localidade cadastrada</h3>
                        <p className="text-adm-ink-muted mb-6">Adicione bairros e regiões para o SEO local da clínica.</p>
                        <button type="button" onClick={addItem} className="bg-adm-primary text-adm-surface font-bold px-8 py-3 rounded-md shadow-md hover:brightness-90 transition-colors">
                            Adicionar primeira localidade
                        </button>
                    </div>
                ) : items.map((item, idx) => {
                    const isExpanded = expandedIdx === idx;
                    return (
                        <div key={idx} className="bg-adm-surface border border-adm-border rounded-lg shadow-sm overflow-hidden">
                            {/* Card header — sempre visível */}
                            <div className="flex items-center justify-between px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                    aria-expanded={isExpanded}
                                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                                >
                                    <MapPin className={`w-4 h-4 shrink-0 ${isExpanded ? 'text-adm-primary' : 'text-adm-ink-faint'}`} aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${isExpanded ? 'text-adm-primary' : 'text-adm-ink'}`}>
                                            {item.nome || <span className="text-adm-ink-faint italic">Localidade #{idx + 1} (sem nome)</span>}
                                        </p>
                                        {item.regiao && (
                                            <p className="text-[11px] text-adm-ink-faint truncate">{item.regiao}</p>
                                        )}
                                    </div>
                                    {isExpanded
                                        ? <ChevronUp className="w-4 h-4 text-adm-ink-faint shrink-0 ml-auto mr-2" aria-hidden="true" />
                                        : <ChevronDown className="w-4 h-4 text-adm-ink-faint shrink-0 ml-auto mr-2" aria-hidden="true" />
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    aria-label={`Excluir localidade ${item.nome || `#${idx + 1}`}`}
                                    className="text-adm-ink-faint hover:text-red-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-all shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Expanded form */}
                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-adm-border space-y-5 pt-5">

                                    {/* Nome + Slug */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass} htmlFor={`nome-${idx}`}>Nome do bairro/região</label>
                                            <input
                                                id={`nome-${idx}`}
                                                type="text"
                                                value={item.nome}
                                                onChange={e => updateField(idx, 'nome', e.target.value)}
                                                className={inputClass}
                                                placeholder="Ex: Pinheiros"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass} htmlFor={`prep-${idx}`}>Preposição</label>
                                            <select
                                                id={`prep-${idx}`}
                                                value={item.prep}
                                                onChange={e => updateField(idx, 'prep', e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="em">em (Clínica em Pinheiros)</option>
                                                <option value="no">no (Clínica no Tatuapé)</option>
                                                <option value="na">na (Clínica na Lapa)</option>
                                                <option value="nos">nos (Clínica nos Jardins)</option>
                                                <option value="nas">nas (Clínica nas Perdizes)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label className={labelClass} htmlFor={`slug-${idx}`}>Slug (URL)</label>
                                        <div className="flex items-stretch bg-adm-elev border border-adm-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-adm-primary/20 focus-within:border-adm-primary">
                                            <span className="px-3 flex items-center font-mono text-xs text-adm-ink-faint bg-adm-elev border-r border-adm-border whitespace-nowrap">/</span>
                                            <input
                                                id={`slug-${idx}`}
                                                type="text"
                                                value={item.slug}
                                                onChange={e => updateSlugDirect(idx, e.target.value)}
                                                className="flex-1 bg-transparent px-3 py-3 text-adm-ink font-mono text-sm focus:outline-none"
                                                placeholder="pinheiros"
                                            />
                                        </div>
                                        <p className="text-[10px] text-adm-ink-faint mt-1.5">
                                            URL das páginas: <code className="bg-adm-elev px-1 rounded">/{item.slug || '...'}/&lt;serviço&gt;</code>
                                        </p>
                                    </div>

                                    {/* Região */}
                                    <div>
                                        <label className={labelClass} htmlFor={`regiao-${idx}`}>Região / descrição geográfica</label>
                                        <input
                                            id={`regiao-${idx}`}
                                            type="text"
                                            value={item.regiao}
                                            onChange={e => updateField(idx, 'regiao', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ex: Zona Oeste de São Paulo"
                                        />
                                    </div>

                                    {/* Referência local */}
                                    <div>
                                        <label className={labelClass} htmlFor={`ref-${idx}`}>Texto de referência local</label>
                                        <textarea
                                            id={`ref-${idx}`}
                                            rows={3}
                                            value={item.referenciaLocal}
                                            onChange={e => updateField(idx, 'referenciaLocal', e.target.value)}
                                            className={`${inputClass} resize-y`}
                                            placeholder="Ex: Atendemos pacientes de Pinheiros e região, perto da Faria Lima..."
                                        />
                                        <p className="text-[10px] text-adm-ink-faint mt-1.5">Aparece na landing page da localidade para contextualizar a proximidade da clínica.</p>
                                    </div>

                                    {/* Bairros vizinhos */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={`${labelClass} mb-0`}>Bairros vizinhos</label>
                                            <button
                                                type="button"
                                                onClick={() => addBairro(idx)}
                                                className="text-[11px] font-semibold text-adm-primary hover:text-adm-primary/80 flex items-center gap-1 px-2 py-1 rounded hover:bg-adm-primary-soft transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar bairro
                                            </button>
                                        </div>
                                        {item.bairrosVizinhos.length === 0 ? (
                                            <p className="text-xs text-adm-ink-faint italic py-2">Nenhum bairro vizinho cadastrado.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {item.bairrosVizinhos.map((bairro, bIdx) => (
                                                    <div key={bIdx} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={bairro}
                                                            onChange={e => updateBairro(idx, bIdx, e.target.value)}
                                                            className={subInputClass}
                                                            placeholder="Ex: Vila Madalena"
                                                            aria-label={`Bairro vizinho ${bIdx + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBairro(idx, bIdx)}
                                                            aria-label={`Remover bairro ${bairro || bIdx + 1}`}
                                                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-adm-ink-faint hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* FAQ */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className={`${labelClass} mb-0`}>FAQ local ({item.faq.length} {item.faq.length === 1 ? 'pergunta' : 'perguntas'})</label>
                                            <button
                                                type="button"
                                                onClick={() => addFaq(idx)}
                                                className="text-[11px] font-semibold text-adm-primary hover:text-adm-primary/80 flex items-center gap-1 px-2 py-1 rounded hover:bg-adm-primary-soft transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar pergunta
                                            </button>
                                        </div>
                                        {item.faq.length === 0 ? (
                                            <p className="text-xs text-adm-ink-faint italic py-2">Nenhuma pergunta cadastrada para esta localidade.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {item.faq.map((faqItem, fIdx) => (
                                                    <div key={fIdx} className="p-4 bg-adm-elev border border-adm-border rounded-lg space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase tracking-widest">Pergunta {fIdx + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFaq(idx, fIdx)}
                                                                aria-label={`Remover pergunta ${fIdx + 1}`}
                                                                className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-adm-ink-faint hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                        <div>
                                                            <label className={`${labelClass} text-[9px]`} htmlFor={`faq-q-${idx}-${fIdx}`}>Pergunta</label>
                                                            <input
                                                                id={`faq-q-${idx}-${fIdx}`}
                                                                type="text"
                                                                value={faqItem.q}
                                                                onChange={e => updateFaq(idx, fIdx, 'q', e.target.value)}
                                                                className={inputClass}
                                                                placeholder="Ex: Vocês atendem urgência em Pinheiros?"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={`${labelClass} text-[9px]`} htmlFor={`faq-a-${idx}-${fIdx}`}>Resposta</label>
                                                            <textarea
                                                                id={`faq-a-${idx}-${fIdx}`}
                                                                rows={2}
                                                                value={faqItem.a}
                                                                onChange={e => updateFaq(idx, fIdx, 'a', e.target.value)}
                                                                className={`${inputClass} resize-y`}
                                                                placeholder="Ex: Sim, temos horários reservados para urgências no mesmo dia."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add button */}
            {items.length > 0 && (
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full p-4 border-2 border-dashed border-adm-border hover:border-adm-primary bg-adm-surface hover:bg-adm-primary-soft rounded-lg text-adm-ink-muted hover:text-adm-primary font-semibold flex items-center justify-center gap-2 transition-all min-h-[52px]"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" /> Adicionar localidade
                </button>
            )}
        </form>
    );
}
