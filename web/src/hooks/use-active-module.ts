'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { getModuleByPath } from '@/lib/modules'

export function useActiveModuleSync() {
  const pathname = usePathname()
  const setActiveModule = useShellStore((s) => s.setActiveModule)

  useEffect(() => {
    const moduleId = getModuleByPath(pathname)
    setActiveModule(moduleId)
  }, [pathname, setActiveModule])
}
