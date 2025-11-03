export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-800 font-medium">{message}</p>
      </div>
    </div>
  );
}

