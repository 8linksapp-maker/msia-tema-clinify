import React, { useState, useEffect } from 'react';
import {
    Save, AlertCircle, Loader2, ChevronDown, ChevronUp,
    Trash2, Plus, GripVertical,
} from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';
import ImageField from './ImageField';

// ─── Types (mirrors page.ts schemas) ────────────────────────────────────────

interface Cta { label: string; href: string; }
interface BreadcrumbItem { label: string; href: string; }

interface HeroProps {
    eyebrow?: string; title: string; lead?: string;
    cta?: Cta;
    rating?: { score: string; count: string; };
    doctor?: { name: string; role: string; photo: string; };
    contact?: { phone: string; hours: string; };
}
interface SobreProps {
    image?: string; badge?: string; eyebrow?: string; title: string;
    lead?: string; benefits?: string[]; cta?: Cta;
}
interface ServicosProps {
    eyebrow?: string; title?: string;
    items: { title: string; text: string; }[];
    cta?: Cta;
}
interface NumerosProps { stats: { value: string; label: string; }[]; }
interface PorqueEscolherProps {
    eyebrow?: string; title?: string; image?: string;
    features: { title: string; text: string; }[];
}
interface ComoFuncionaProps {
    eyebrow?: string; title?: string;
    steps: { n: string; title: string; text: string; }[];
}
interface EquipeProps {
    eyebrow?: string; title?: string;
    members: { name: string; role: string; photo: string; }[];
}
interface DepoimentosProps {
    eyebrow?: string; title?: string;
    rating?: { score: string; label: string; };
    items: { quote: string; name: string; role: string; }[];
}
interface AntesDepoisProps {
    eyebrow?: string; title?: string;
    items: { label: string; before: string; after: string; }[];
}
interface NovidadesProps {
    eyebrow?: string; title?: string;
    items: { title: string; excerpt: string; image: string; href: string; }[];
}
interface CtaContatoProps {
    eyebrow?: string; title?: string; services?: string[];
}
interface PageHeaderProps {
    eyebrow?: string; title: string; lead?: string;
    breadcrumb?: BreadcrumbItem[];
}

type BlockType =
    | { type: 'hero'; props: HeroProps }
    | { type: 'sobre'; props: SobreProps }
    | { type: 'servicos'; props: ServicosProps }
    | { type: 'numeros'; props: NumerosProps }
    | { type: 'porqueEscolher'; props: PorqueEscolherProps }
    | { type: 'comoFunciona'; props: ComoFuncionaProps }
    | { type: 'equipe'; props: EquipeProps }
    | { type: 'depoimentos'; props: DepoimentosProps }
    | { type: 'antesDepois'; props: AntesDepoisProps }
    | { type: 'novidades'; props: NovidadesProps }
    | { type: 'ctaContato'; props: CtaContatoProps }
    | { type: 'pageHeader'; props: PageHeaderProps };

interface PageMeta { title: string; description: string; }

interface PageEditorProps {
    /** Path relativo ao repo, ex: 'src/data/page.json' */
    dataPath: string;
    /** true = home (sem meta wrapper). false = inner page (tem meta) */
    isHome?: boolean;
    pageLabel: string;
}

// ─── Block label map ─────────────────────────────────────────────────────────
const BLOCK_LABELS: Record<string, string> = {
    hero: 'Hero',
    sobre: 'Sobre a clínica',
    servicos: 'Serviços',
    numeros: 'Números',
    porqueEscolher: 'Por que nos escolher',
    comoFunciona: 'Como funciona',
    equipe: 'Equipe',
    depoimentos: 'Depoimentos',
    antesDepois: 'Antes e depois',
    novidades: 'Novidades (artigos)',
    ctaContato: 'CTA de contato',
    pageHeader: 'Cabeçalho da página',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputClass = 'w-full bg-adm-surface border border-adm-border rounded-md px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-adm-primary/80 focus:ring-2 focus:ring-adm-primary/20 transition-all shadow-sm';
const labelClass = 'block text-xs font-bold text-adm-ink-muted uppercase tracking-wider mb-1.5 ml-0.5';
const subHeadClass = 'text-[10px] font-bold text-adm-ink-faint uppercase tracking-widest mb-3 mt-5';
const itemCardClass = 'p-4 bg-adm-bg border border-adm-border rounded-lg space-y-3';

function CtaFields({ cta, onChange }: { cta?: Cta; onChange: (c: Cta) => void }) {
    const c = cta || { label: '', href: '' };
    return (
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={labelClass}>CTA — Texto</label>
                <input type="text" value={c.label} onChange={e => onChange({ ...c, label: e.target.value })} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>CTA — Link</label>
                <input type="text" value={c.href} onChange={e => onChange({ ...c, href: e.target.value })} className={inputClass} />
            </div>
        </div>
    );
}

// ─── Block-specific field renderers ──────────────────────────────────────────

function HeroFields({ props, onChange }: { props: HeroProps; onChange: (p: HeroProps) => void }) {
    const p = props;
    const up = (k: keyof HeroProps, v: any) => onChange({ ...p, [k]: v });
    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título *</label><input type="text" value={p.title} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Lead</label><textarea rows={2} value={p.lead || ''} onChange={e => up('lead', e.target.value)} className={`${inputClass} resize-y`} /></div>
            <CtaFields cta={p.cta} onChange={v => up('cta', v)} />
            <p className={subHeadClass}>Rating</p>
            <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Score</label><input type="text" value={p.rating?.score || ''} onChange={e => up('rating', { ...p.rating, score: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Count</label><input type="text" value={p.rating?.count || ''} onChange={e => up('rating', { ...p.rating, count: e.target.value })} className={inputClass} /></div>
            </div>
            <p className={subHeadClass}>Médico em destaque</p>
            <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Nome</label><input type="text" value={p.doctor?.name || ''} onChange={e => up('doctor', { ...p.doctor, name: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Especialidade</label><input type="text" value={p.doctor?.role || ''} onChange={e => up('doctor', { ...p.doctor, role: e.target.value })} className={inputClass} /></div>
            </div>
            <ImageField label="Foto" value={p.doctor?.photo || ''} onChange={v => up('doctor', { ...p.doctor, photo: v })} placeholder="/images/doctor.jpg" hint="Recomendado: 1200×900px · proporção 4:3 · JPG ou WebP" />
            <p className={subHeadClass}>Contato no hero</p>
            <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Telefone</label><input type="text" value={p.contact?.phone || ''} onChange={e => up('contact', { ...p.contact, phone: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Horário</label><input type="text" value={p.contact?.hours || ''} onChange={e => up('contact', { ...p.contact, hours: e.target.value })} className={inputClass} /></div>
            </div>
        </div>
    );
}

function SobreFields({ props, onChange }: { props: SobreProps; onChange: (p: SobreProps) => void }) {
    const p = props;
    const up = (k: keyof SobreProps, v: any) => onChange({ ...p, [k]: v });
    const benefits = p.benefits || [];

    const addBenefit = () => up('benefits', [...benefits, '']);
    const removeBenefit = (i: number) => up('benefits', benefits.filter((_, idx) => idx !== i));
    const updateBenefit = (i: number, v: string) => up('benefits', benefits.map((b, idx) => idx === i ? v : b));

    return (
        <div className="space-y-3">
            <ImageField label="Imagem" value={p.image || ''} onChange={v => up('image', v)} placeholder="/images/about.jpg" hint="Recomendado: 1200×900px · proporção 4:3 · JPG ou WebP" />
            <div><label className={labelClass}>Badge</label><input type="text" value={p.badge || ''} onChange={e => up('badge', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título *</label><input type="text" value={p.title} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Lead</label><textarea rows={2} value={p.lead || ''} onChange={e => up('lead', e.target.value)} className={`${inputClass} resize-y`} /></div>
            <CtaFields cta={p.cta} onChange={v => up('cta', v)} />
            <p className={subHeadClass}>Benefícios</p>
            <div className="space-y-2">
                {benefits.map((b, i) => (
                    <div key={i} className="flex gap-2">
                        <input type="text" value={b} onChange={e => updateBenefit(i, e.target.value)} className={`${inputClass} flex-1`} placeholder={`Benefício ${i + 1}`} />
                        <button type="button" onClick={() => removeBenefit(i)} className="text-red-500 hover:text-red-700 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addBenefit} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar benefício</button>
        </div>
    );
}

function ServicosFields({ props, onChange }: { props: ServicosProps; onChange: (p: ServicosProps) => void }) {
    const p = props;
    const up = (k: keyof ServicosProps, v: any) => onChange({ ...p, [k]: v });
    const items = p.items || [];

    const addItem = () => up('items', [...items, { title: '', text: '' }]);
    const removeItem = (i: number) => up('items', items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, k: 'title' | 'text', v: string) =>
        up('items', items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <CtaFields cta={p.cta} onChange={v => up('cta', v)} />
            <p className={subHeadClass}>Serviços ({items.length})</p>
            <div className="space-y-3">
                {items.map((it, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Serviço {i + 1}</span>
                            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Título</label><input type="text" value={it.title} onChange={e => updateItem(i, 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Texto</label><input type="text" value={it.text} onChange={e => updateItem(i, 'text', e.target.value)} className={inputClass} /></div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar serviço</button>
        </div>
    );
}

function NumerosFields({ props, onChange }: { props: NumerosProps; onChange: (p: NumerosProps) => void }) {
    const stats = props.stats || [];
    const up = (v: NumerosProps['stats']) => onChange({ stats: v });
    const addStat = () => up([...stats, { value: '', label: '' }]);
    const removeStat = (i: number) => up(stats.filter((_, idx) => idx !== i));
    const updateStat = (i: number, k: 'value' | 'label', v: string) =>
        up(stats.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

    return (
        <div className="space-y-3">
            <p className={subHeadClass}>Estatísticas ({stats.length})</p>
            <div className="space-y-3">
                {stats.map((s, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Número {i + 1}</span>
                            <button type="button" onClick={() => removeStat(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelClass}>Valor</label><input type="text" value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} className={inputClass} placeholder="15+" /></div>
                            <div><label className={labelClass}>Label</label><input type="text" value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} className={inputClass} placeholder="Anos de experiência" /></div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addStat} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar número</button>
        </div>
    );
}

function PorqueEscolherFields({ props, onChange }: { props: PorqueEscolherProps; onChange: (p: PorqueEscolherProps) => void }) {
    const p = props;
    const up = (k: keyof PorqueEscolherProps, v: any) => onChange({ ...p, [k]: v });
    const features = p.features || [];
    const addFeat = () => up('features', [...features, { title: '', text: '' }]);
    const removeFeat = (i: number) => up('features', features.filter((_, idx) => idx !== i));
    const updateFeat = (i: number, k: 'title' | 'text', v: string) =>
        up('features', features.map((f, idx) => idx === i ? { ...f, [k]: v } : f));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <ImageField label="Imagem" value={p.image || ''} onChange={v => up('image', v)} placeholder="/images/why.jpg" hint="Recomendado: 1200×800px · proporção 3:2 · JPG ou WebP" />
            <p className={subHeadClass}>Diferenciais ({features.length})</p>
            <div className="space-y-3">
                {features.map((f, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Item {i + 1}</span>
                            <button type="button" onClick={() => removeFeat(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Título</label><input type="text" value={f.title} onChange={e => updateFeat(i, 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Texto</label><input type="text" value={f.text} onChange={e => updateFeat(i, 'text', e.target.value)} className={inputClass} /></div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addFeat} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar diferencial</button>
        </div>
    );
}

function ComoFuncionaFields({ props, onChange }: { props: ComoFuncionaProps; onChange: (p: ComoFuncionaProps) => void }) {
    const p = props;
    const up = (k: keyof ComoFuncionaProps, v: any) => onChange({ ...p, [k]: v });
    const steps = p.steps || [];
    const addStep = () => up('steps', [...steps, { n: String(steps.length + 1).padStart(2, '0'), title: '', text: '' }]);
    const removeStep = (i: number) => up('steps', steps.filter((_, idx) => idx !== i));
    const updateStep = (i: number, k: 'n' | 'title' | 'text', v: string) =>
        up('steps', steps.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <p className={subHeadClass}>Passos ({steps.length})</p>
            <div className="space-y-3">
                {steps.map((s, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Passo {i + 1}</span>
                            <button type="button" onClick={() => removeStep(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <div><label className={labelClass}>Nº</label><input type="text" value={s.n} onChange={e => updateStep(i, 'n', e.target.value)} className={inputClass} /></div>
                            <div className="col-span-3"><label className={labelClass}>Título</label><input type="text" value={s.title} onChange={e => updateStep(i, 'title', e.target.value)} className={inputClass} /></div>
                        </div>
                        <div><label className={labelClass}>Texto</label><input type="text" value={s.text} onChange={e => updateStep(i, 'text', e.target.value)} className={inputClass} /></div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addStep} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar passo</button>
        </div>
    );
}

function EquipeFields({ props, onChange }: { props: EquipeProps; onChange: (p: EquipeProps) => void }) {
    const p = props;
    const up = (k: keyof EquipeProps, v: any) => onChange({ ...p, [k]: v });
    const members = p.members || [];
    const addMember = () => up('members', [...members, { name: '', role: '', photo: '' }]);
    const removeMember = (i: number) => up('members', members.filter((_, idx) => idx !== i));
    const updateMember = (i: number, k: 'name' | 'role' | 'photo', v: string) =>
        up('members', members.map((m, idx) => idx === i ? { ...m, [k]: v } : m));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <p className={subHeadClass}>Membros ({members.length})</p>
            <div className="space-y-3">
                {members.map((m, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Membro {i + 1}</span>
                            <button type="button" onClick={() => removeMember(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Nome</label><input type="text" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Especialidade</label><input type="text" value={m.role} onChange={e => updateMember(i, 'role', e.target.value)} className={inputClass} /></div>
                        <ImageField label="Foto" value={m.photo} onChange={v => updateMember(i, 'photo', v)} placeholder="/images/team-1.jpg" hint="Recomendado: 800×1066px · retrato 3:4 · JPG ou WebP" />
                    </div>
                ))}
            </div>
            <button type="button" onClick={addMember} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar membro</button>
        </div>
    );
}

function DepoimentosFields({ props, onChange }: { props: DepoimentosProps; onChange: (p: DepoimentosProps) => void }) {
    const p = props;
    const up = (k: keyof DepoimentosProps, v: any) => onChange({ ...p, [k]: v });
    const items = p.items || [];
    const addItem = () => up('items', [...items, { quote: '', name: '', role: '' }]);
    const removeItem = (i: number) => up('items', items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, k: 'quote' | 'name' | 'role', v: string) =>
        up('items', items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Rating — Score</label><input type="text" value={p.rating?.score || ''} onChange={e => up('rating', { ...p.rating, score: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Rating — Label</label><input type="text" value={p.rating?.label || ''} onChange={e => up('rating', { ...p.rating, label: e.target.value })} className={inputClass} /></div>
            </div>
            <p className={subHeadClass}>Depoimentos ({items.length})</p>
            <div className="space-y-3">
                {items.map((it, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Depoimento {i + 1}</span>
                            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Citação</label><textarea rows={2} value={it.quote} onChange={e => updateItem(i, 'quote', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelClass}>Nome</label><input type="text" value={it.name} onChange={e => updateItem(i, 'name', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Função</label><input type="text" value={it.role} onChange={e => updateItem(i, 'role', e.target.value)} className={inputClass} /></div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar depoimento</button>
        </div>
    );
}

function AntesDepoisFields({ props, onChange }: { props: AntesDepoisProps; onChange: (p: AntesDepoisProps) => void }) {
    const p = props;
    const up = (k: keyof AntesDepoisProps, v: any) => onChange({ ...p, [k]: v });
    const items = p.items || [];
    const addItem = () => up('items', [...items, { label: '', before: '', after: '' }]);
    const removeItem = (i: number) => up('items', items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, k: 'label' | 'before' | 'after', v: string) =>
        up('items', items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <p className={subHeadClass}>Pares antes/depois ({items.length})</p>
            <div className="space-y-3">
                {items.map((it, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Par {i + 1}</span>
                            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Rótulo</label><input type="text" value={it.label} onChange={e => updateItem(i, 'label', e.target.value)} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <ImageField label="Antes" value={it.before} onChange={v => updateItem(i, 'before', v)} placeholder="/images/before-1.jpg" hint="Recomendado: 800×800px · quadrada 1:1" />
                            <ImageField label="Depois" value={it.after} onChange={v => updateItem(i, 'after', v)} placeholder="/images/after-1.jpg" hint="Recomendado: 800×800px · quadrada 1:1" />
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar par</button>
        </div>
    );
}

function NovidadesFields({ props, onChange }: { props: NovidadesProps; onChange: (p: NovidadesProps) => void }) {
    const p = props;
    const up = (k: keyof NovidadesProps, v: any) => onChange({ ...p, [k]: v });
    const items = p.items || [];
    const addItem = () => up('items', [...items, { title: '', excerpt: '', image: '', href: '' }]);
    const removeItem = (i: number) => up('items', items.filter((_, idx) => idx !== i));
    const updateItem = (i: number, k: 'title' | 'excerpt' | 'image' | 'href', v: string) =>
        up('items', items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <p className={subHeadClass}>Artigos em destaque ({items.length})</p>
            <p className="text-[11px] text-adm-ink-faint -mt-2 mb-2">Estes artigos são estáticos — para o feed dinâmico use a seção Artigos do menu.</p>
            <div className="space-y-3">
                {items.map((it, i) => (
                    <div key={i} className={itemCardClass}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase">Artigo {i + 1}</span>
                            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        <div><label className={labelClass}>Título</label><input type="text" value={it.title} onChange={e => updateItem(i, 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Resumo</label><input type="text" value={it.excerpt} onChange={e => updateItem(i, 'excerpt', e.target.value)} className={inputClass} /></div>
                        <ImageField label="Imagem" value={it.image} onChange={v => updateItem(i, 'image', v)} placeholder="/images/post-1.jpg" hint="Recomendado: 1200×750px · proporção 16:10 · JPG ou WebP" />
                        <div><label className={labelClass}>Link</label><input type="text" value={it.href} onChange={e => updateItem(i, 'href', e.target.value)} className={inputClass} placeholder="/blog/meu-artigo" /></div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar artigo</button>
        </div>
    );
}

function CtaContatoFields({ props, onChange }: { props: CtaContatoProps; onChange: (p: CtaContatoProps) => void }) {
    const p = props;
    const up = (k: keyof CtaContatoProps, v: any) => onChange({ ...p, [k]: v });
    const services = p.services || [];
    const addService = () => up('services', [...services, '']);
    const removeService = (i: number) => up('services', services.filter((_, idx) => idx !== i));
    const updateService = (i: number, v: string) =>
        up('services', services.map((s, idx) => idx === i ? v : s));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título</label><input type="text" value={p.title || ''} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <p className={subHeadClass}>Serviços no seletor ({services.length})</p>
            <div className="space-y-2">
                {services.map((s, i) => (
                    <div key={i} className="flex gap-2">
                        <input type="text" value={s} onChange={e => updateService(i, e.target.value)} className={`${inputClass} flex-1`} placeholder={`Serviço ${i + 1}`} />
                        <button type="button" onClick={() => removeService(i)} className="text-red-500 hover:text-red-700 px-2"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addService} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar serviço</button>
        </div>
    );
}

function PageHeaderFields({ props, onChange }: { props: PageHeaderProps; onChange: (p: PageHeaderProps) => void }) {
    const p = props;
    const up = (k: keyof PageHeaderProps, v: any) => onChange({ ...p, [k]: v });
    const breadcrumb = p.breadcrumb || [];
    const addBc = () => up('breadcrumb', [...breadcrumb, { label: '', href: '' }]);
    const removeBc = (i: number) => up('breadcrumb', breadcrumb.filter((_, idx) => idx !== i));
    const updateBc = (i: number, k: 'label' | 'href', v: string) =>
        up('breadcrumb', breadcrumb.map((b, idx) => idx === i ? { ...b, [k]: v } : b));

    return (
        <div className="space-y-3">
            <div><label className={labelClass}>Eyebrow</label><input type="text" value={p.eyebrow || ''} onChange={e => up('eyebrow', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Título *</label><input type="text" value={p.title} onChange={e => up('title', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Lead</label><textarea rows={2} value={p.lead || ''} onChange={e => up('lead', e.target.value)} className={`${inputClass} resize-y`} /></div>
            <p className={subHeadClass}>Breadcrumb ({breadcrumb.length})</p>
            <div className="space-y-2">
                {breadcrumb.map((b, i) => (
                    <div key={i} className="flex gap-2">
                        <input type="text" value={b.label} onChange={e => updateBc(i, 'label', e.target.value)} className={`${inputClass} flex-1`} placeholder="Label" />
                        <input type="text" value={b.href} onChange={e => updateBc(i, 'href', e.target.value)} className={`${inputClass} flex-1`} placeholder="/link" />
                        <button type="button" onClick={() => removeBc(i)} className="text-red-500 hover:text-red-700 px-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addBc} className="text-xs text-adm-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar item</button>
        </div>
    );
}

// ─── Block card wrapper ───────────────────────────────────────────────────────

function BlockCard({
    block, index, total, onChange, onMoveUp, onMoveDown, onRemove,
}: {
    block: BlockType; index: number; total: number;
    onChange: (b: BlockType) => void;
    onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const label = BLOCK_LABELS[block.type] || block.type;

    const renderFields = () => {
        switch (block.type) {
            case 'hero':          return <HeroFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'sobre':         return <SobreFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'servicos':      return <ServicosFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'numeros':       return <NumerosFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'porqueEscolher':return <PorqueEscolherFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'comoFunciona':  return <ComoFuncionaFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'equipe':        return <EquipeFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'depoimentos':   return <DepoimentosFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'antesDepois':   return <AntesDepoisFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'novidades':     return <NovidadesFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'ctaContato':    return <CtaContatoFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            case 'pageHeader':    return <PageHeaderFields props={block.props} onChange={p => onChange({ ...block, props: p })} />;
            default:              return <p className="text-xs text-adm-ink-faint">Tipo desconhecido: {(block as any).type}</p>;
        }
    };

    return (
        <div className="bg-adm-surface border border-adm-border rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-adm-border">
                <GripVertical className="w-4 h-4 text-adm-ink-faint shrink-0" />
                <span className="text-[10px] font-bold text-adm-ink-faint uppercase tracking-widest mr-1">{index + 1}</span>
                <span className="text-sm font-semibold text-adm-ink flex-1">{label}</span>
                <code className="text-[10px] bg-adm-elev text-adm-ink-faint px-1.5 py-0.5 rounded">{block.type}</code>
                <div className="flex items-center gap-1 ml-2">
                    <button type="button" onClick={onMoveUp} disabled={index === 0} className="p-1 rounded text-adm-ink-faint hover:text-adm-ink disabled:opacity-30 transition-colors" title="Mover para cima">
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded text-adm-ink-faint hover:text-adm-ink disabled:opacity-30 transition-colors" title="Mover para baixo">
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={onRemove} className="p-1 rounded text-red-400 hover:text-red-600 transition-colors ml-1" title="Remover bloco">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => setOpen(o => !o)} className="p-1 rounded text-adm-ink-muted hover:text-adm-ink transition-colors ml-1">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            {open && (
                <div className="p-5">
                    {renderFields()}
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PageEditor({ dataPath, isHome = false, pageLabel }: PageEditorProps) {
    const [blocks, setBlocks] = useState<BlockType[]>([]);
    const [meta, setMeta] = useState<PageMeta>({ title: '', description: '' });
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        githubApi('read', dataPath)
            .then(res => {
                const parsed = JSON.parse(res?.content || '{}');
                setBlocks(isHome ? (parsed.blocks || []) : (parsed.blocks || []));
                if (!isHome) setMeta(parsed.meta || { title: '', description: '' });
                setFileSha(res.sha);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [dataPath]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando página...', 'progress', 20);
        try {
            const payload = isHome ? { blocks } : { meta, blocks };
            const res = await githubApi('write', dataPath, {
                content: JSON.stringify(payload, null, 2),
                sha: fileSha,
                message: `CMS: Update ${dataPath}`,
            });
            setFileSha(res.sha);
            triggerToast('Página salva!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateBlock = (idx: number, block: BlockType) =>
        setBlocks(bs => bs.map((b, i) => i === idx ? block : b));

    const moveUp = (idx: number) => setBlocks(bs => {
        if (idx === 0) return bs;
        const next = [...bs];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        return next;
    });

    const moveDown = (idx: number) => setBlocks(bs => {
        if (idx === bs.length - 1) return bs;
        const next = [...bs];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        return next;
    });

    const removeBlock = (idx: number) =>
        setBlocks(bs => bs.filter((_, i) => i !== idx));

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-adm-ink-faint bg-adm-surface rounded-lg border border-adm-border">
            <Loader2 className="w-10 h-10 animate-pulse mb-6 text-adm-ink-faint" />
            <p className="font-semibold text-sm animate-pulse text-adm-ink-muted">Carregando {dataPath}...</p>
        </div>
    );

    const inputClass2 = 'w-full bg-adm-surface border border-adm-border rounded-md px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-adm-primary/80 focus:ring-2 focus:ring-adm-primary/20 transition-all shadow-sm';
    const labelClass2 = 'block text-xs font-bold text-adm-ink-muted uppercase tracking-wider mb-1.5 ml-0.5';

    return (
        <form onSubmit={handleSave} className="max-w-3xl pb-32 space-y-4">
            {/* Action bar */}
            <div className="flex items-center justify-between bg-adm-surface p-4 px-6 rounded-lg border border-adm-border shadow-sm sticky top-4 z-10">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">{pageLabel}</h2>
                    <p className="text-xs text-adm-ink-muted mt-0.5">
                        {blocks.length} bloco{blocks.length !== 1 ? 's' : ''} · <code className="bg-adm-elev px-1 rounded">{dataPath}</code>
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
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex gap-3 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
            )}

            {/* Meta (only inner pages) */}
            {!isHome && (
                <div className="p-5 bg-adm-surface border border-adm-border rounded-lg shadow-sm">
                    <h3 className="text-sm font-bold text-adm-ink mb-4 border-b border-adm-border pb-2">SEO da página</h3>
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass2}>Título (tag title)</label>
                            <input type="text" value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} className={inputClass2} />
                        </div>
                        <div>
                            <label className={labelClass2}>Meta descrição</label>
                            <textarea rows={2} value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))} className={`${inputClass2} resize-y`} />
                        </div>
                    </div>
                </div>
            )}

            {/* Blocks */}
            {blocks.length === 0 ? (
                <div className="p-12 text-center text-adm-ink-faint border-2 border-dashed border-adm-border rounded-lg">
                    <p className="font-medium text-sm">Nenhum bloco ainda</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {blocks.map((block, idx) => (
                        <BlockCard
                            key={idx}
                            block={block}
                            index={idx}
                            total={blocks.length}
                            onChange={b => updateBlock(idx, b)}
                            onMoveUp={() => moveUp(idx)}
                            onMoveDown={() => moveDown(idx)}
                            onRemove={() => removeBlock(idx)}
                        />
                    ))}
                </div>
            )}
        </form>
    );
}
