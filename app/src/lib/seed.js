/** Inventaire initial des épices (06/07/2026). Une ligne = un produit, ";n" = nombre de pots (1 par défaut). */
const SEED_LINES = {
  "Cuisine": `Baie de genièvre
Quatre épices
Piment de Cayenne
Ras el hanout jaune
Poivre de Sichuan;0
Piment d'Espelette
Garam masala
Romarin
Basilic
Bouquet garni
Cerfeuil
Aneth
Ciboulette
Estragon
Persil
Origan
Persillade
Cumin en graines
Ail semoule
Muscade moulue
Noix de muscade
Anis vert
Cardamome moulue
Cumin moulu
Curcuma
Curry vert thaï
Épices marocaines
Chili en poudre
Mélange thaï pour wok
Curry rouge piquant
Coriandre en graines
Vadouvan masala maison
Marinade curry
Gingembre moulu
Safran
Clou de girofle
Baies roses
Bois d'Inde moulu
Mélange italien;2
Thym
Herbes de Provence
Moulin saveur grillades
Noisettes concassées
Moulin poivre blanc
Moulin 5 baies
Bois d'Inde entier
Pimentón
Ail frit
Macis de noix de muscade`,
  "Sous chauffage": `Cannelle en bâtons
Piment de Cayenne entier
Coriandre en poudre
Paprika doux
Curry indien
Épices couscous;0
Ñora pepper;0
Cannelle moulue
Épices à paella
Carvi noir entier
Poivre noir entier
Rouille
Safran
Poivre de Madagascar
Poivre de Malabar;0
Poivre de Tellicherry
Poivre long de Java
Cardamome noire entière
Épices kefta
Épices Colombo;0
Pimentón;0
Anis étoilé (badiane)
Asafoetida;0
Muscade moulue
Coriandre moulue
Cumin moulu
Clous de girofle moulus
Cardamome moulue
Clous de girofle
Ras el hanout`,
  "Réserve entrée": `Cardamome moulue
Persillade
Baies roses
Bouquet garni
Ciboulette
Estragon
Quatre épices;3
Romarin
Piment de Jamaïque
Poivre blanc en grains
Piment de Cayenne
Poivre vert;2
Coriandre entière
Coriandre moulue;2
Cardamome verte
Anis en grains
Persil
Basilic
Curcuma moulu
Coriandre en grains
Piment oiseau entier
Garam masala;2
Curry Madras
Anis étoilé (badiane)
Carvi entier
Épices couscous
Ras el hanout jaune
Clous de girofle
Poivre de Sichuan
Piment fort en poudre
Cumin moulu;3
Cumin entier
Fenouil entier
Ras el hanout rouge
Muscade moulue
Curry doux
Noix de muscade
Noix de muscade moulue
Piment d'Espelette
Paprika fumé au bois de chêne
Herbes de Provence
Poivre noir`,
  "Autre": `Feuille de citron kaffir
Ajowan en graines
Feuille de curry (kaloupilé)
Cardamome noire
Citronnelle
Fenugrec
Poivre de Sichuan vert
Graines de sésame doré
Graines de sésame noir
Poivre de Madagascar
Safran en pistils
Poivre de Szechwan
Poivre de Sichuan noir
Graines de chia noir
Poudre de mangue séchée
Spiruline`,
  "Vegan": `Huile de coco
Flocons d'avoine
Noix de cajou`
}

export function seedRows(householdId) {
  const rows = []
  for (const [loc, lines] of Object.entries(SEED_LINES)) {
    for (const line of lines.split("\n")) {
      const [name, qty] = line.split(";")
      rows.push({
        household_id: householdId,
        name: name.trim(),
        loc,
        qty: qty === undefined ? 1 : Number(qty),
        min: 0,
        store: ""
      })
    }
  }
  return rows
}
