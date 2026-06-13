"use client";

import { calculerProportions, INSTRUCTIONS_PATE } from "@/lib/recipe";
import { Button, Card } from "./ui";

export default function Recipe({
  nbPizzas,
  onRetour,
}: {
  nbPizzas: number;
  onRetour: () => void;
}) {
  const proportions = calculerProportions(nbPizzas);

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-6 safe-bottom">
      <header className="flex items-center gap-3">
        <button onClick={onRetour} className="text-2xl text-charcoal/50" aria-label="Retour">
          ←
        </button>
        <h1 className="text-xl font-bold text-tomatoDark">Recette &amp; proportions</h1>
      </header>

      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">Ingrédients</h2>
          <span className="text-sm text-charcoal/50">
            {nbPizzas} pizza{nbPizzas > 1 ? "s" : ""}
          </span>
        </div>
        <ul className="divide-y divide-black/5">
          {proportions.map((p) => (
            <li key={p.nom} className="flex items-center justify-between py-2.5">
              <span className={p.nom.startsWith("ou") ? "text-charcoal/60" : ""}>{p.nom}</span>
              <span className="font-semibold tabular-nums">
                {p.quantite} {p.unite}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Préparation de la pâte</h2>
        <ol className="space-y-3">
          {INSTRUCTIONS_PATE.map((etape, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomato/10 text-xs font-bold text-tomato">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{etape}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Button variant="secondary" onClick={onRetour} className="w-full">
        Retour au planning
      </Button>
    </div>
  );
}
