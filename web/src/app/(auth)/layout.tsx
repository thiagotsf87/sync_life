// Onda 1 (v5): o chrome de auth agora vive em cada tela (componentes auth-v5);
// o wrapper v3 (.auth-page + tema forçado) saiu junto com o visual antigo.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
