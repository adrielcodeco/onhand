import React from 'react'

export function Out({ children }: any) {
  return (
    <div>
      <div>
        <button>Configurar Perfil</button>
      </div>
      {...children}
    </div>
  )
}
