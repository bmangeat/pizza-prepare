import { Button } from "./ui";

export default function Home({
  onNouvelle,
  onAdmin,
}: {
  onNouvelle: () => void;
  onAdmin: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pt-10 safe-bottom">
      <div className="flex items-start justify-between">
        <div />
        <button
          onClick={onAdmin}
          aria-label="Paramètres"
          className="rounded-full p-2 text-2xl text-charcoal/50 transition hover:bg-black/5"
        >
          ⚙️
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 text-7xl" aria-hidden>
          🍕
        </div>
        <h1 className="text-3xl font-bold text-tomatoDark">Pâte à Pizza</h1>
        <p className="mt-3 max-w-xs text-charcoal/70">
          Préparez une pâte napolitaine parfaite. L&apos;application calcule votre planning et
          vous prévient à chaque étape.
        </p>
      </div>

      <Button onClick={onNouvelle} className="w-full text-lg">
        Nouvelle préparation
      </Button>
    </div>
  );
}
