import React from 'react'
import { createRoot } from 'react-dom/client'
import '../app/styles/globals.css'

function IndexPopup() {
  return (
    <div className="w-96 h-96 p-4 bg-white">
      <h1 className="text-xl font-bold">Ave Wallet</h1>
      <p>Your crypto wallet extension</p>
    </div>
  )
}

export default IndexPopup

// Create root for React 18
const container = document.getElementById('__plasmo')
const root = createRoot(container)
root.render(<IndexPopup />)