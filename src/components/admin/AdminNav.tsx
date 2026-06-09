import { LayoutDashboard, Building2, LogOut } from 'lucide-react';

interface Props { activeSection?: string; }

const links = [
  { label: 'Leads', href: '/admin', icon: LayoutDashboard, key: 'leads' },
  { label: 'Dados da clínica', href: '/admin/config', icon: Building2, key: 'config' },
];

export default function AdminNav({ activeSection = '' }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-stone-200 flex flex-col">
      <a href="/admin" className="px-6 h-16 flex items-center font-bold text-teal-800 text-lg border-b border-stone-200">
        Painel da clínica
      </a>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = activeSection === l.key;
          return (
            <a
              key={l.key}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <Icon size={18} /> {l.label}
            </a>
          );
        })}
      </nav>
      <a href="/api/admin/logout" className="m-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100">
        <LogOut size={18} /> Sair
      </a>
    </aside>
  );
}
