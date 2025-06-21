"use client"

export default function RotatingMap() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[800px] h-[800px] animate-spin-slow">
        {/* Map Grid */}
        <svg viewBox="0 0 800 800" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Streets */}
          <path d="M100 200 L700 200" stroke="#d1d5db" strokeWidth="3" />
          <path d="M100 400 L700 400" stroke="#d1d5db" strokeWidth="3" />
          <path d="M100 600 L700 600" stroke="#d1d5db" strokeWidth="3" />
          <path d="M200 100 L200 700" stroke="#d1d5db" strokeWidth="3" />
          <path d="M400 100 L400 700" stroke="#d1d5db" strokeWidth="3" />
          <path d="M600 100 L600 700" stroke="#d1d5db" strokeWidth="3" />

          {/* Business Markers */}
          <circle cx="250" cy="250" r="8" fill="#3b82f6" />
          <circle cx="350" cy="180" r="8" fill="#8b5cf6" />
          <circle cx="450" cy="320" r="8" fill="#10b981" />
          <circle cx="550" cy="280" r="8" fill="#f59e0b" />
          <circle cx="320" cy="450" r="8" fill="#ef4444" />
          <circle cx="480" cy="520" r="8" fill="#06b6d4" />
          <circle cx="180" cy="380" r="8" fill="#8b5cf6" />
          <circle cx="620" cy="420" r="8" fill="#10b981" />

          {/* Connecting Lines */}
          <path d="M250 250 L350 180" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <path d="M350 180 L450 320" stroke="#8b5cf6" strokeWidth="2" opacity="0.3" />
          <path d="M450 320 L550 280" stroke="#10b981" strokeWidth="2" opacity="0.3" />
        </svg>
      </div>
    </div>
  )
}
