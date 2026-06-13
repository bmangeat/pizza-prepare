import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-tomato text-white shadow-sm hover:bg-tomatoDark",
    secondary: "bg-white text-tomato border border-tomato/30 hover:bg-tomato/5",
    ghost: "bg-transparent text-charcoal/70 hover:bg-black/5",
    danger: "bg-white text-tomato border border-tomato/40 hover:bg-tomato/5",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "bg-basil/10 text-basil ring-basil/20",
    warn: "bg-amber-100 text-amber-800 ring-amber-200",
    error: "bg-tomato/10 text-tomatoDark ring-tomato/20",
  };
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm ring-1 ${tones[tone]}`}>{children}</div>
  );
}
