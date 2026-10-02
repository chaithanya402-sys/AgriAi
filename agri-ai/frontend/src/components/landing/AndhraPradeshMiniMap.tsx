import React from 'react'

export function AndhraPradeshMiniMap({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#E8F6ED]/70 p-2 border border-[#D0EDE0] ${className}`}>
      <svg
        viewBox="0 0 160 130"
        className="w-full h-auto max-h-[105px] select-none drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Andhra Pradesh State Silhouette */}
        <path
          d="M 132,14 
             C 138,20 141,28 137,35 
             C 133,42 125,50 119,57 
             C 113,64 107,72 103,80 
             C 99,88 94,97 88,106 
             C 83,114 77,122 70,121 
             C 63,120 59,112 53,108 
             C 45,102 33,104 25,100 
             C 19,96 17,88 21,83 
             C 25,78 35,76 41,72 
             C 49,68 56,62 63,56 
             C 69,50 75,42 83,36 
             C 91,30 99,22 109,16 
             C 118,12 125,8 132,14 Z"
          fill="#D6EFE0"
          stroke="#A6DCB8"
          strokeWidth="1.2"
        />

        {/* Faint internal district boundary lines */}
        <path
          d="M 122,28 C 116,33 111,39 108,45"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeDasharray="2 1"
        />
        <path
          d="M 108,45 C 101,51 95,55 91,59"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        <path
          d="M 91,59 C 83,65 79,71 75,79"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        <path
          d="M 101,71 C 93,73 85,75 77,79"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeDasharray="2 1"
        />
        <path
          d="M 75,79 C 67,85 55,89 45,91"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
        <path
          d="M 61,91 C 63,99 67,107 69,117"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />

        {/* Highlight Pin in Central AP (Amaravati / Guntur-Krishna delta) */}
        <g transform="translate(86, 68)">
          <circle cx="0" cy="0" r="8" fill="#16803A" fillOpacity="0.2" className="animate-ping origin-center" />
          <circle cx="0" cy="0" r="5" fill="#16803A" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}
