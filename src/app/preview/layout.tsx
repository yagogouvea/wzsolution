// Layout específico para rotas /preview/*
// Este layout substitui o layout global, removendo Header, Footer e WhatsAppButton

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


