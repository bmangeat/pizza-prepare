export interface Ingredient {
  nom: string;
  /** Quantité de référence pour 6 pizzas. */
  ref6: number;
  unite: string;
  /** Précision d'arrondi (1 = entier, 0.1 = 1 décimale). */
  arrondi: number;
}

/** Proportions de référence pour 6 pizzas (section 6). */
export const INGREDIENTS_REF: Ingredient[] = [
  { nom: "Farine", ref6: 930, unite: "g", arrondi: 1 },
  { nom: "Eau", ref6: 600, unite: "g", arrondi: 1 },
  { nom: "Sel", ref6: 30, unite: "g", arrondi: 1 },
  { nom: "Levure sèche", ref6: 2.7, unite: "g", arrondi: 0.1 },
  { nom: "ou Levure fraîche", ref6: 6.3, unite: "g", arrondi: 0.1 },
];

export interface QuantiteCalculee {
  nom: string;
  quantite: number;
  unite: string;
}

/** Quantité = (référence ÷ 6) × nb_pizzas, arrondie selon la précision de l'ingrédient. */
export function calculerProportions(nbPizzas: number): QuantiteCalculee[] {
  return INGREDIENTS_REF.map((ing) => {
    const brut = (ing.ref6 / 6) * nbPizzas;
    const facteur = 1 / ing.arrondi;
    const quantite = Math.round(brut * facteur) / facteur;
    return { nom: ing.nom, quantite, unite: ing.unite };
  });
}

/** Instructions de pétrissage affichées pendant l'étape 1 (section 7). */
export const INSTRUCTIONS_PATE: string[] = [
  "Prélever un peu d'eau et y diluer la levure",
  "Mélanger le reste d'eau avec le sel",
  "Incorporer 180 g de farine à l'eau salée et mélanger",
  "Ajouter la levure diluée et mélanger",
  "Ajouter le reste de farine",
  "Travailler la pâte pendant 15 minutes",
  "Recouvrir et laisser reposer 15 minutes",
  "Effectuer 2× des rabats",
  "Recouvrir et laisser reposer 15 minutes",
  "Effectuer à nouveau 2× des rabats",
  "Lancer le 1er pointage à température ambiante",
];
