import React from 'react';

interface IllustrationProps {
  selected?: boolean;
  className?: string;
}

export function CasualIllustration({ selected = false, className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="80"
        height="80"
        rx="20"
        fill={selected ? '#E0F2FE' : '#F0F9FF'}
      />
      {/* Hoodie body */}
      <path
        d="M27 30L17 41L23 47L28 41V65C28 66.6569 29.3431 68 31 68H57C58.6569 68 60 66.6569 60 65V41L65 47L71 41L61 30C58 27.5 53 26 44 26C35 26 30 27.5 27 30Z"
        fill="#38BDF8"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Hood */}
      <path
        d="M34 26C34 21 38.5 18 44 18C49.5 18 54 21 54 26C51 28.5 47.5 30 44 30C40.5 30 37 28.5 34 26Z"
        fill="#BAE6FD"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Drawstrings */}
      <path
        d="M40 30V39M48 30V37"
        stroke="#0369A1"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Kangaroo pocket */}
      <path
        d="M35 51H53L55 61H33L35 51Z"
        fill="#E0F2FE"
        stroke="#0369A1"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Ribbed hem */}
      <path
        d="M29 63H59"
        stroke="#0369A1"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NeatOutingIllustration({ selected = false, className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="80"
        height="80"
        rx="20"
        fill={selected ? '#E0F2FE' : '#F0F9FF'}
      />
      {/* Inner collared shirt */}
      <path
        d="M36 22L44 28L52 22L55 32L44 45L33 32L36 22Z"
        fill="#FFFFFF"
        stroke="#0369A1"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Cardigan outer */}
      <path
        d="M27 28L17 40L23 46L28 40V66C28 67.6569 29.3431 69 31 69H57C58.6569 69 60 67.6569 60 66V40L65 46L71 40L61 28L52 24L44 45L36 24L27 28Z"
        fill="#7DD3FC"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Shirt collar tips */}
      <path
        d="M36 22L41 29L44 26L47 29L52 22"
        stroke="#0369A1"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center placket line & buttons */}
      <path d="M44 45V69" stroke="#0369A1" strokeWidth="2.2" />
      <circle cx="44" cy="51" r="2" fill="#0369A1" />
      <circle cx="44" cy="59" r="2" fill="#0369A1" />
      {/* Neat pocket */}
      <path
        d="M50 53H56V59C56 60.1046 55.1046 61 54 61H52C50.8954 61 50 60.1046 50 59V53Z"
        fill="#E0F2FE"
        stroke="#0369A1"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ActiveWearIllustration({ selected = false, className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="80"
        height="80"
        rx="20"
        fill={selected ? '#E0F2FE' : '#F0F9FF'}
      />
      {/* Windbreaker jacket */}
      <path
        d="M27 28L16 40L22 46L28 40V65C28 66.6569 29.3431 68 31 68H57C58.6569 68 60 66.6569 60 65V40L66 46L72 40L61 28L52 23H36L27 28Z"
        fill="#0EA5E9"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Stand-up collar */}
      <path
        d="M36 23V18H52V23"
        fill="#BAE6FD"
        stroke="#0369A1"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Color-block chest band */}
      <path
        d="M28 42H60V50H28V42Z"
        fill="#E0F2FE"
      />
      {/* Center zipper */}
      <path d="M44 19V68" stroke="#0369A1" strokeWidth="2.4" />
      <rect x="41.5" y="27" width="5" height="4" rx="1" fill="#FFFFFF" stroke="#0369A1" strokeWidth="1.6" />
      {/* Sporty sleeve stripes */}
      <path d="M20 36L26 30M68 36L62 30" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      {/* Side zip pockets */}
      <path d="M32 54L35 61M56 54L53 61" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ClassicIllustration({ selected = false, className = '' }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="80"
        height="80"
        rx="20"
        fill={selected ? '#E0F2FE' : '#F0F9FF'}
      />
      {/* Inner turtleneck / shirt */}
      <path
        d="M37 19H51V32L44 46L37 32V19Z"
        fill="#FFFFFF"
        stroke="#0C4A6E"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Tailored coat / blazer */}
      <path
        d="M26 27L17 42L24 46L28 40V68C28 69.6569 29.3431 71 31 71H57C58.6569 71 60 69.6569 60 68V40L64 46L71 42L62 27L51 23L44 46L37 23L26 27Z"
        fill="#0284C7"
        stroke="#0C4A6E"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Tailored notched lapels */}
      <path
        d="M37 23L32 34L36 37L34 40L44 46"
        fill="#BAE6FD"
        stroke="#0C4A6E"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M51 23L56 34L52 37L54 40L44 46"
        fill="#BAE6FD"
        stroke="#0C4A6E"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Coat center seam & double buttons */}
      <path d="M44 46V71" stroke="#0C4A6E" strokeWidth="2.2" />
      <circle cx="39" cy="53" r="2.1" fill="#E0F2FE" stroke="#0C4A6E" strokeWidth="1.5" />
      <circle cx="49" cy="53" r="2.1" fill="#E0F2FE" stroke="#0C4A6E" strokeWidth="1.5" />
      <circle cx="39" cy="62" r="2.1" fill="#E0F2FE" stroke="#0C4A6E" strokeWidth="1.5" />
      <circle cx="49" cy="62" r="2.1" fill="#E0F2FE" stroke="#0C4A6E" strokeWidth="1.5" />
    </svg>
  );
}
