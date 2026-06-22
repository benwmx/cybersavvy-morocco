import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DocMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mt-2 mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-semibold text-slate-800 mt-6 mb-2 pb-1 border-b border-slate-100">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1">{children}</h3>,
        p: ({ children }) => <p className="text-sm text-slate-700 leading-relaxed mb-2">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ms-3 mb-3 text-sm text-slate-700">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ms-3 mb-3 text-sm text-slate-700">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
        a: ({ href, children }) => (
          <a href={href} className="text-[#1E3A8A] underline hover:opacity-70" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-s-4 border-slate-200 ps-4 text-slate-500 italic mb-3">{children}</blockquote>
        ),
        pre: ({ children }) => (
          <div className="mb-3 rounded bg-slate-100 p-3 overflow-x-auto">
            {children}
          </div>
        ),
        code: ({ className, children }) => {
          const isBlock = !!className || String(children).includes("\n");
          if (isBlock) {
            return <code className="font-mono text-xs text-slate-800 block whitespace-pre">{children}</code>;
          }
          return <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{children}</code>;
        },
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="text-xs text-slate-700 border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        th: ({ children }) => <th className="px-3 py-1.5 border border-slate-200 font-semibold text-left">{children}</th>,
        td: ({ children }) => <td className="px-3 py-1.5 border border-slate-200">{children}</td>,
        hr: () => <hr className="my-4 border-slate-100" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
