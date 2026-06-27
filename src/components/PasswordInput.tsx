"use client"

import { useState } from "react"

export function PasswordInput({ value, onChange, placeholder, autoFocus, minLength, style: customStyle, label }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  minLength?: number
  style?: React.CSSProperties
  label?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      {label && <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{label}</label>}
      <div style={{ position: "relative", ...customStyle }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required
          minLength={minLength}
          style={{
            width: "100%", padding: "10px 44px 10px 10px", border: "0.5px solid #e0dfd8",
            borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#888",
            padding: "4px", lineHeight: 1,
          }}
          aria-label={show ? "隐藏密码" : "显示密码"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  )
}
