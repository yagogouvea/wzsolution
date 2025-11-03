export default function LayoutSplitView({ left, right, children }: any) {
  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="border-r border-gray-200 bg-white relative">{left}</div>
      <div className="bg-gray-50">{right}</div>
      {children}
    </div>
  );
}

