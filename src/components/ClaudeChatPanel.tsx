"use client";

import { useState } from "react";

export default function ClaudeChatPanel({ onSubmitPrompt }: { onSubmitPrompt: (prompt: string) => void }) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      onSubmitPrompt(input);
      setInput("");
    }
  }

  return (
    <div className="h-screen flex flex-col border-l border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">💬 Assistente IA</h2>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
        <p className="text-gray-500 text-center mt-12">Digite uma ideia de site para começar</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 outline-none"
          placeholder="Ex: Crie um site para minha barbearia retrô"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800">
          Gerar
        </button>
      </form>
    </div>
  );
}

