import './errorState.css'

const configs = {
  '404': {
    title: 'Page not found',
    message:
      "We looked everywhere but couldn't find what you're looking for.",
    cta: 'Go to Dashboard',
    illustration: <Illustration404 />,
  },

  unauthorized: {
    title: 'Session expired',
    message:
      'Your session has expired. Sign in again to continue.',
    cta: 'Sign In',
    illustration: <IllustrationLock />,
  },

  forbidden: {
    title: 'Access denied',
    message:
      "You don't have permission to view this content.",
    cta: 'Go Back',
    illustration: <IllustrationLock />,
  },

  server: {
    title: 'Something went wrong',
    message:
      "We're having trouble on our end. Please try again in a moment.",
    cta: 'Try Again',
    illustration: <IllustrationServer />,
  },

  network: {
    title: 'No connection',
    message:
      'Check your internet connection and try again.',
    cta: 'Retry',
    illustration: <IllustrationNetwork />,
  },

  'empty-tasks': {
    title: 'No tasks yet',
    message:
      "You're all clear. Create your first task to get started.",
    cta: 'Create Task',
    illustration: <IllustrationTasks />,
  },

  'empty-categories': {
    title: 'No categories',
    message:
      'Organize your tasks by creating your first category.',
    cta: 'Create Category',
    illustration: <IllustrationTags />,
  },
}

export default function ErrorState({ type, onAction }) {
  const cfg = configs[type]

  if (!cfg) return null

  return (
    <div className="error-state fade-in">
      <div className="error-state-illustration">
        {cfg.illustration}
      </div>

      <h2 className="error-state-title">
        {cfg.title}
      </h2>

      <p className="error-state-message">
        {cfg.message}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="error-state-button"
      >
        {cfg.cta}
      </button>
    </div>
  )
}

/* =========================================
   SVG Illustrations
   ========================================= */

function Illustration404() {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="20"
        y="30"
        width="80"
        height="55"
        rx="8"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <line
        x1="20"
        y1="44"
        x2="100"
        y2="44"
        stroke="#7C3AED"
        strokeWidth="2"
      />

      <circle cx="30" cy="37" r="3" fill="#EF4444" />
      <circle cx="40" cy="37" r="3" fill="#FFB800" />
      <circle cx="50" cy="37" r="3" fill="#16A34A" />

      <text
        x="60"
        y="73"
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fill="#EDE9FE"
        fontFamily="Inter,sans-serif"
      >
        404
      </text>

      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="#7C3AED"
        fontFamily="Inter,sans-serif"
      >
        404
      </text>

      <path
        d="M46 20 Q60 10 74 20"
        stroke="#7C3AED"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.3"
      />

      <path
        d="M52 14 Q60 6 68 14"
        stroke="#7C3AED"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.15"
      />
    </svg>
  )
}

function IllustrationLock() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="22"
        y="50"
        width="56"
        height="38"
        rx="8"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <rect
        x="33"
        y="50"
        width="34"
        height="38"
        rx="0"
        fill="#EDE9FE"
      />

      <path
        d="M35 50V37C35 28.716 43 22 50 22C57 22 65 28.716 65 37V50"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      <circle
        cx="50"
        cy="67"
        r="6"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="white"
      />

      <line
        x1="50"
        y1="67"
        x2="50"
        y2="76"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="20"
        cy="22"
        r="5"
        stroke="#FFB800"
        strokeWidth="2"
        fill="none"
      />

      <circle
        cx="80"
        cy="82"
        r="4"
        stroke="#FFB800"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

function IllustrationServer() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="18"
        y="22"
        width="64"
        height="18"
        rx="5"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <rect
        x="18"
        y="46"
        width="64"
        height="18"
        rx="5"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <rect
        x="18"
        y="70"
        width="64"
        height="18"
        rx="5"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <circle cx="30" cy="31" r="3" fill="#16A34A" />
      <circle cx="30" cy="55" r="3" fill="#16A34A" />
      <circle cx="30" cy="79" r="3" fill="#EF4444" />

      <line
        x1="72"
        y1="72"
        x2="78"
        y2="78"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="78"
        y1="72"
        x2="72"
        y2="78"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IllustrationNetwork() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 55 Q35 30 50 55 Q65 80 80 55"
        stroke="#ECECEF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M28 62 Q38 40 50 62 Q62 84 72 62"
        stroke="#ECECEF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M36 69 Q44 52 50 69 Q56 86 64 69"
        stroke="#ECECEF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M20 55 Q35 30 50 55 Q65 80 80 55"
        stroke="#7C3AED"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="12 8"
      />

      <circle
        cx="50"
        cy="55"
        r="6"
        fill="#7C3AED"
      />

      <line
        x1="18"
        y1="18"
        x2="82"
        y2="82"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

function IllustrationTasks() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="18"
        y="22"
        width="64"
        height="60"
        rx="10"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
      />

      <line
        x1="32"
        y1="40"
        x2="68"
        y2="40"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />

      <line
        x1="32"
        y1="52"
        x2="56"
        y2="52"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />

      <line
        x1="32"
        y1="64"
        x2="48"
        y2="64"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.15"
      />

      <circle
        cx="72"
        cy="28"
        r="13"
        fill="#7C3AED"
      />

      <line
        x1="72"
        y1="22"
        x2="72"
        y2="34"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="66"
        y1="28"
        x2="78"
        y2="28"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IllustrationTags() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 22 L48 22 L72 46 L48 70 L22 70 Z"
        stroke="#7C3AED"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />

      <circle
        cx="34"
        cy="38"
        r="5"
        stroke="#7C3AED"
        strokeWidth="2"
        fill="none"
      />

      <path
        d="M42 36 L54 36 L68 50 L54 64 L42 64"
        stroke="#ECECEF"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />

      <circle
        cx="72"
        cy="28"
        r="12"
        fill="#EDE9FE"
        stroke="#7C3AED"
        strokeWidth="2"
      />

      <line
        x1="72"
        y1="22"
        x2="72"
        y2="34"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="66"
        y1="28"
        x2="78"
        y2="28"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}