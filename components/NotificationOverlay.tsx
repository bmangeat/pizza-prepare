"use client";

import type { EtapeCalculee } from "@/lib/types";
import { Button } from "./ui";

export default function NotificationOverlay({
  etape,
  onClose,
}: {
  etape: EtapeCalculee;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="text-4xl">⏰</div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-tomato">
          Nouvelle étape
        </p>
        <h2 className="mt-1 text-2xl font-bold text-tomatoDark">{etape.nom}</h2>
        <p className="mt-2 text-charcoal/70">{etape.action}</p>
        <p className="mt-1 text-sm text-charcoal/50">
          {etape.dureeLabel} · 🌡️ {etape.temperature}
        </p>
        <Button onClick={onClose} className="mt-5 w-full">
          OK
        </Button>
      </div>
    </div>
  );
}
