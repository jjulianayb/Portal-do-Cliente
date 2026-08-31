import { useState, type FormEvent } from "react";
import { Bot, FileText, Send, ShieldCheck, Sparkles, X } from "lucide-react";

export type BeeContext = {
  userName: string;
  organizationName: string;
  role: string;
  capabilities: string[];
  employeeLinked: boolean;
  screen: string;
};

type BeeShellProps = { context?: BeeContext; onSubmit?: (message: string) => void };
const defaultContext: BeeContext = { userName: "Ana", organizationName: "Sua organização", role: "Colaborador", capabilities: ["read:own_profile", "read:own_development"], employeeLinked: true, screen: "home" };

export default function BeeShell({ context = defaultContext, onSubmit }: BeeShellProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = message.trim(); if (!value) return; setSent(value); setMessage(""); onSubmit?.(value); }
  return <div className="relative">
    {open && <section className="absolute bottom-16 right-0 z-10 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between bg-gradient-to-br from-[#102654] to-[#315da0] p-5 text-white"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Bot size={22} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Bee</p><h2 className="mt-1 text-lg font-bold">Estou aqui para ajudar</h2></div></div><button aria-label="Fechar Bee" className="rounded-full p-1 text-white/80 hover:bg-white/10" onClick={() => setOpen(false)}><X size={18} /></button></header>
      <div className="space-y-4 p-5"><div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600"><div className="flex items-center gap-2 font-semibold text-slate-800"><ShieldCheck size={15} className="text-emerald-600" /> Contexto permitido</div><p className="mt-2">{context.userName} · {context.role}</p><p>{context.organizationName} · tela {context.screen}</p><p className="mt-1 text-slate-400">{context.employeeLinked ? "Perfil de colaborador vinculado" : "Perfil não vinculado"}</p></div>
      {sent ? <div className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-900"><p className="font-semibold">Mensagem recebida</p><p className="mt-1">{sent}</p><p className="mt-2 text-xs text-blue-700">A resposta e as fontes aparecerão quando o contrato de inteligência estiver conectado.</p></div> : <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Pergunte sobre desenvolvimento, tarefas ou próximos passos. A Bee só poderá agir dentro das permissões do contexto.</div>}
      <div className="flex flex-wrap gap-2 text-xs">{context.capabilities.slice(0, 3).map((capability) => <span key={capability} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">{capability}</span>)}</div><form className="flex gap-2" onSubmit={submit}><input aria-label="Mensagem para a Bee" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva uma pergunta..." /><button aria-label="Enviar mensagem" className="rounded-xl bg-[#1e3a6e] px-3 text-white disabled:opacity-40" disabled={!message.trim()}><Send size={16} /></button></form></div>
    </section>}
    <button className="flex items-center gap-2 rounded-full bg-[#1e3a6e] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#152c57]" onClick={() => setOpen(!open)}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><Sparkles size={15} /></span> Falar com a Bee</button>
  </div>;
}

export function BeePreview() { return <BeeShell />; }

