"use client";

import { useEffect, useRef } from "react";
import { convertJSXToHTML } from "@/lib/jsx-to-html";

export default function SitePreview({ code }: { code: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && code) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        
        // Converter JSX para HTML se necessário
        const htmlContent = code.includes('import') || code.includes('export default')
          ? convertJSXToHTML(code, { 
              removeComplexExpressions: true,
              convertClassName: true,
              preserveInlineStyles: true,
              addTailwind: true 
            })
          : code;
        
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [code]);

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      {code ? (
        <iframe ref={iframeRef} className="w-full h-full border-none" title="Preview do Site" sandbox="allow-scripts allow-same-origin" />
      ) : (
        <div className="text-gray-400 text-center">
          <p className="text-xl font-medium">🧠 Gere seu primeiro site com IA</p>
          <p className="text-sm mt-2">Digite uma ideia no chat ao lado para começar</p>
        </div>
      )}
    </div>
  );
}
