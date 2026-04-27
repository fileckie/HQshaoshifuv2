'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
  )
}
