import React from "react";
export default function ProductArt({ product: p }) {
  return (
    <div className={`product-art ${p.tone || "sage"}`}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {p.icon === "chair" ? (
          <>
            <path d="M13 29V19c0-5 22-5 22 0v10" fill="#b59773" />
            <path
              d="M10 24v10h28V24M14 34l-2 9m22-9 2 9"
              stroke="#655542"
              strokeWidth="3"
            />
            <rect x="13" y="27" width="22" height="8" rx="3" fill="#cab391" />
          </>
        ) : p.icon === "lamp" ? (
          <>
            <path d="M15 20 21 7h8l6 13Z" fill="#8a9d84" />
            <path d="M25 21v18m-8 2h16" stroke="#53694e" strokeWidth="3" />
          </>
        ) : p.icon === "vase" ? (
          <path
            d="M20 8h8l-1 10c2 4 9 9 9 17 0 9-24 9-24 0 0-8 7-13 9-17Z"
            fill="#b67d60"
          />
        ) : p.icon === "table" ? (
          <>
            <ellipse cx="24" cy="19" rx="17" ry="6" fill="#bba07a" />
            <path
              d="m13 22-2 18m24-18 2 18M24 24v17"
              stroke="#8a714f"
              strokeWidth="3"
            />
          </>
        ) : p.icon === "cushion" ? (
          <>
            <rect x="9" y="10" width="30" height="29" rx="7" fill="#b99496" />
            <path d="M13 14h22v21H13Z" stroke="#e2c7c8" strokeWidth="1" />
          </>
        ) : p.icon === "plant" ? (
          <>
            <path
              d="M24 27V10m0 11c-11 0-12-11-12-11 12 0 12 11 12 11m0-6c10 0 12-10 12-10-11 0-12 10-12 10"
              stroke="#617d53"
              strokeWidth="3"
            />
            <path d="m14 27 3 15h14l3-15Z" fill="#b7876b" />
          </>
        ) : (
          <>
            <path d="m10 19 4 21h20l4-21Z" fill="#bb9e70" />
            <path
              d="M17 20v-5a7 7 0 0 1 14 0v5M12 26h24m-22 7h20"
              stroke="#8d734b"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
    </div>
  );
}
