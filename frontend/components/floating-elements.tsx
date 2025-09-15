import React from 'react'

export function FloatingElements() {
  return React.createElement('div', {
    className: 'fixed inset-0 pointer-events-none z-0 overflow-hidden'
  },
    React.createElement('div', {
      className: 'absolute top-1/4 left-1/4 w-12 h-12 bg-purple-500/20 rounded-lg animate-bounce opacity-70'
    }),
    React.createElement('div', {
      className: 'absolute top-3/4 right-1/4 w-12 h-12 bg-purple-500/20 rounded-lg animate-bounce opacity-70',
      style: { animationDelay: '1s' }
    }),
    React.createElement('div', {
      className: 'absolute top-1/2 right-1/3 w-12 h-12 bg-purple-500/20 rounded-lg animate-bounce opacity-70',
      style: { animationDelay: '2s' }
    }),
    React.createElement('div', {
      className: 'absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2'
    },
      React.createElement('div', {
        className: 'text-4xl font-bold text-gray-800/10 animate-pulse'
      }, 'MVP')
    )
  )
}
