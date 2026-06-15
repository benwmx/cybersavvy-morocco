import type { ReactNode } from "react";

export function DocMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (!list.length) return;
    out.push(
      <ul key={key} className="list-disc list-inside space-y-1 ms-3 mb-3 text-sm text-slate-700">
        {list.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
      </ul>
    );
    list = [];
  };

  const renderInline = (s: string): React.ReactNode => {
    const parts = s.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{p.slice(1, -1)}</code>;
      return p;
    });
  };

  lines.forEach((line, i) => {
    const raw = line.trim();
    if (!raw) { flushList(`fl-${i}`); return; }
    if (raw.startsWith("- ") || raw.startsWith("• ") || raw.startsWith("* ")) {
      list.push(raw.slice(2)); return;
    }
    flushList(`fl-${i}`);
    if (raw.startsWith("# "))
      out.push(<h1 key={i} className="text-lg font-bold text-slate-900 mt-2 mb-3">{raw.slice(2)}</h1>);
    else if (raw.startsWith("## "))
      out.push(<h2 key={i} className="text-sm font-semibold text-slate-800 mt-6 mb-2 pb-1 border-b border-slate-100">{raw.slice(3)}</h2>);
    else if (raw.startsWith("### "))
      out.push(<h3 key={i} className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1">{raw.slice(4)}</h3>);
    else if (raw.startsWith("| ")) {
      const cells = raw.split("|").map(c => c.trim()).filter(Boolean);
      const isSep = cells.every(c => /^-+$/.test(c));
      if (!isSep)
        out.push(
          <div key={i} className="flex text-xs">
            {cells.map((c, ci) => (
              <div key={ci} className="flex-1 px-3 py-1.5 border border-slate-200 text-slate-700">{renderInline(c)}</div>
            ))}
          </div>
        );
    } else
      out.push(<p key={i} className="text-sm text-slate-700 leading-relaxed mb-2">{renderInline(raw)}</p>);
  });
  flushList("final");

  return <div className="space-y-0">{out}</div>;
}
