import Link from "next/link";

export default function ClaudeHome() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">🤖 WZ Solution</h1>
        <p className="text-xl text-gray-600">Gerador de Sites com Claude IA</p>
        
        <Link 
          href="/claude" 
          className="inline-block bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-800 transition shadow-lg"
        >
          🚀 Criar meu site com IA
        </Link>
        
        <p className="text-sm text-gray-500 mt-4">
          Powered by Claude 3.5 Sonnet
        </p>
      </div>
    </div>
  );
}

