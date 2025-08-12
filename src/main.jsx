import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function Root() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <React.StrictMode>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-800 p-2 rounded"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <App />
    </React.StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
