import { useShellStore } from '@/stores/shell-store'

export function useShell() {
  return useShellStore()
}

export function useSidebarOpen() {
  return useShellStore((s) => s.sidebarOpen)
}

export function useActiveModule() {
  return useShellStore((s) => s.activeModule)
}
