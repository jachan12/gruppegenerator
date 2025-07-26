
/*// Hjælpefunktion: Shuffle array (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Hent elever fra tabellen
function hentEleverFraTabel() {
  const elever = [];
  const tbody = document.getElementById("elev-tabel");
  const rækker = tbody.querySelectorAll("tr");

  rækker.forEach(række => {
    const inputs = række.querySelectorAll("input[type=text]");
    if (inputs.length < 6) return; // Sikrer at rækken har nok inputs (navn, 3 ønsker, 2 fravalg)

    const navn = inputs[0].value.trim();
    if (!navn) return; // Spring over tomme navne

    const ønsker = [
      inputs[1].value.trim(),
      inputs[2].value.trim(),
      inputs[3].value.trim(),
    ].filter(s => s !== "");

    const fravalg = [
      inputs[4].value.trim(),
      inputs[5].value.trim(),
    ].filter(s => s !== "");

    elever.push({ navn, ønsker, fravalg });
  });

  return elever;
}

// Lav grupper (gruppestørrelse kan sættes)
function lavGrupper(elever, gruppestørrelse = 3) {
  const kopieret = [...elever];
  shuffle(kopieret);

  const grupper = [];
  for (let i = 0; i < kopieret.length; i += gruppestørrelse) {
    grupper.push(kopieret.slice(i, i + gruppestørrelse));
  }

  return grupper;
}

// Lav grupper ud fra ønsket fordeling
function lavGrupperMedFordeling(elever, antal2, antal3, antal4) {
  const kopieret = [...elever];
  shuffle(kopieret);

  const grupper = [];
  let idx = 0;

  for (let i = 0; i < antal2; i++) {
    grupper.push(kopieret.slice(idx, idx + 2));
    idx += 2;
  }
  for (let i = 0; i < antal3; i++) {
    grupper.push(kopieret.slice(idx, idx + 3));
    idx += 3;
  }
  for (let i = 0; i < antal4; i++) {
    grupper.push(kopieret.slice(idx, idx + 4));
    idx += 4;
  }

  // Hvis der er resterende elever, fordel dem én i hver gruppe (runde robin)
  let rest = kopieret.slice(idx);
  let g = 0;
  while (rest.length > 0) {
    grupper[g % grupper.length].push(rest.shift());
    g++;
  }

  // Fjern evt. tomme grupper (kan ske hvis for mange grupper ift. antal elever)
  return grupper.filter(gruppe => gruppe.length > 0);
}

// Helper: normaliser navn (trim og lowercase)
function normNavn(navn) {
  return navn.trim().toLowerCase();
}

// Beregn score ud fra grupper og ønsker/fravalg
function beregnScore(grupper) {
  let total = 0;
  for (const gruppe of grupper) {
    for (let i = 0; i < gruppe.length; i++) {
      const a = gruppe[i];
      const aNavn = normNavn(a.navn);
      const aØnsker = a.ønsker.map(normNavn);
      const aFravalg = a.fravalg.map(normNavn);

      for (let j = 0; j < gruppe.length; j++) {
        if (i === j) continue;
        const b = gruppe[j];
        const bNavn = normNavn(b.navn);
        const bØnsker = b.ønsker.map(normNavn);

        if (aFravalg.includes(bNavn)) {
          total -= 5;
        } else if (aØnsker.includes(bNavn) && bØnsker.includes(aNavn)) {
          total += 3; // gensidigt ønske
        } else if (aØnsker.includes(bNavn)) {
          total += 1;
        }
        // 0 hvis ikke ønsket og ikke fravalgt
      }
    }
  }
  return total;
}

// Smart optimering af grupper med simulated annealing
function smartGruppeOptimering(elever, gruppestørrelse = 3, maxIter = 10000) {
  // Start med en tilfældig fordeling
  let grupper = lavGrupper(elever, gruppestørrelse);
  let bedsteGrupper = grupper.map(g => [...g]);
  let bedsteScore = beregnScore(grupper);
  let currentScore = bedsteScore;

  function deepCloneGrupper(grupper) {
    return grupper.map(g => g.slice());
  }

  for (let iter = 0; iter < maxIter; iter++) {
    // Lav en kopi af grupperne
    let nyeGrupper = deepCloneGrupper(grupper);

    // Vælg to tilfældige grupper og byt to tilfældige elever
    let g1 = Math.floor(Math.random() * nyeGrupper.length);
    let g2 = Math.floor(Math.random() * nyeGrupper.length);
    if (g1 === g2 || nyeGrupper[g1].length === 0 || nyeGrupper[g2].length === 0) continue;

    let i1 = Math.floor(Math.random() * nyeGrupper[g1].length);
    let i2 = Math.floor(Math.random() * nyeGrupper[g2].length);

    // Byt eleverne
    [nyeGrupper[g1][i1], nyeGrupper[g2][i2]] = [nyeGrupper[g2][i2], nyeGrupper[g1][i1]];

    // Beregn score
    let nyScore = beregnScore(nyeGrupper);

    // Hvis bedre, eller med lille sandsynlighed dårligere (annealing)
    if (nyScore > currentScore || Math.random() < 0.05) {
      grupper = nyeGrupper;
      currentScore = nyScore;
      if (nyScore > bedsteScore) {
        bedsteScore = nyScore;
        bedsteGrupper = deepCloneGrupper(nyeGrupper);
      }
    }
  }

  return { grupper: bedsteGrupper, score: bedsteScore };
}

// Smart optimering af grupper med simulated annealing og fordeling
function smartGruppeOptimeringMedFordeling(elever, antal2, antal3, antal4, maxIter = 5000) {
  let grupper = lavGrupperMedFordeling(elever, antal2, antal3, antal4);
  let bedsteGrupper = grupper.map(g => [...g]);
  let bedsteScore = beregnScore(grupper);
  let currentScore = bedsteScore;

  function deepCloneGrupper(grupper) {
    return grupper.map(g => g.slice());
  }

  for (let iter = 0; iter < maxIter; iter++) {
    let nyeGrupper = deepCloneGrupper(grupper);

    // Vælg to tilfældige grupper og byt to tilfældige elever
    let g1 = Math.floor(Math.random() * nyeGrupper.length);
    let g2 = Math.floor(Math.random() * nyeGrupper.length);
    if (g1 === g2 || nyeGrupper[g1].length === 0 || nyeGrupper[g2].length === 0) continue;

    let i1 = Math.floor(Math.random() * nyeGrupper[g1].length);
    let i2 = Math.floor(Math.random() * nyeGrupper[g2].length);

    // Byt eleverne
    [nyeGrupper[g1][i1], nyeGrupper[g2][i2]] = [nyeGrupper[g2][i2], nyeGrupper[g1][i1]];

    // Tjek at grupperne stadig har de rigtige størrelser
    const sizes = nyeGrupper.map(g => g.length);
    const ønskedeSizes = [
      ...Array(antal2).fill(2),
      ...Array(antal3).fill(3),
      ...Array(antal4).fill(4)
    ];
    ønskedeSizes.length = nyeGrupper.length; // Sikrer samme længde
    let valid = sizes.every((sz, idx) => sz >= ønskedeSizes[idx]);
    if (!valid) continue;

    let nyScore = beregnScore(nyeGrupper);

    if (nyScore > currentScore || Math.random() < 0.05) {
      grupper = nyeGrupper;
      currentScore = nyScore;
      if (nyScore > bedsteScore) {
        bedsteScore = nyScore;
        bedsteGrupper = deepCloneGrupper(nyeGrupper);
      }
    }
  }

  return { grupper: bedsteGrupper, score: bedsteScore };
}


// Ny algoritme: Fordel elever i grupper med hard constraints og statistik
function fordelEleverMedPoint(elever, antal2, antal3, antal4, maxIter = 1000) {
  function erGyldigGruppe(gruppe) {
    for (let i = 0; i < gruppe.length; i++) {
      const a = gruppe[i];
      const aFravalg = a.fravalg.map(normNavn);
      for (let j = 0; j < gruppe.length; j++) {
        if (i === j) continue;
        const b = gruppe[j];
        const bNavn = normNavn(b.navn);
        if (aFravalg.includes(bNavn)) return false;
      }
    }
    return true;
  }

  function lavGrupperUdFraStørrelser(elever, sizes) {
    const kopieret = [...elever];
    shuffle(kopieret);
    const grupper = [];
    let idx = 0;
    for (let s of sizes) {
      grupper.push(kopieret.slice(idx, idx + s));
      idx += s;
    }
    let rest = kopieret.slice(idx);
    let g = 0;
    while (rest.length > 0 && grupper.length > 0) {
      grupper[g % grupper.length].push(rest.shift());
      g++;
    }
    return grupper.filter(g => g.length > 0);
  }

  function beregnPointOgStat(grupper) {
    let total = 0, ønskerOpfyldt = 0, gensidige = 0, fravalgUndgået = 0, fravalgBrudt = 0;
    for (const gruppe of grupper) {
      for (let i = 0; i < gruppe.length; i++) {
        const a = gruppe[i];
        const aNavn = normNavn(a.navn);
        const aØnsker = a.ønsker.map(normNavn);
        const aFravalg = a.fravalg.map(normNavn);
        for (let j = 0; j < gruppe.length; j++) {
          if (i === j) continue;
          const b = gruppe[j];
          const bNavn = normNavn(b.navn);
          const bØnsker = b.ønsker.map(normNavn);
          if (aFravalg.includes(bNavn)) {
            fravalgBrudt++;
            total -= 5;
          } else if (aØnsker.includes(bNavn) && bØnsker.includes(aNavn)) {
            gensidige++;
            total += 2;
          } else if (aØnsker.includes(bNavn)) {
            ønskerOpfyldt++;
            total += 1;
          } else {
            fravalgUndgået++;
          }
        }
      }
    }
    return { total, ønskerOpfyldt, gensidige, fravalgUndgået, fravalgBrudt };
  }

  let sizes = [
    ...Array(antal2).fill(2),
    ...Array(antal3).fill(3),
    ...Array(antal4).fill(4)
  ];

  let bedste = null;
  let bedsteScore = -Infinity;
  let bedsteStat = null;

  for (let iter = 0; iter < maxIter; iter++) {
    let grupper = lavGrupperUdFraStørrelser(elever, sizes);
    if (!grupper.every(erGyldigGruppe)) continue;
    let stat = beregnPointOgStat(grupper);
    if (stat.fravalgBrudt > 0) continue;
    if (stat.total > bedsteScore) {
      bedsteScore = stat.total;
      bedste = grupper.map(g => g.slice());
      bedsteStat = stat;
    }
  }

  if (!bedste) {
    return { grupper: [], score: 0, ønskerOpfyldt: 0, gensidige: 0, fravalgUndgået: 0, fravalgBrudt: 0 };
  }

  return {
    grupper: bedste,
    score: bedsteStat.total,
    ønskerOpfyldt: bedsteStat.ønskerOpfyldt,
    gensidige: bedsteStat.gensidige,
    fravalgUndgået: bedsteStat.fravalgUndgået,
    fravalgBrudt: bedsteStat.fravalgBrudt
  };
}

// Find bedste gruppering (bruger nu smart optimering)
function findBedsteGruppeinddeling(elever, antalForsøg = 1000, gruppestørrelse = 3) {
  // Brug smart optimering i stedet for ren brute force
  return smartGruppeOptimering(elever, gruppestørrelse, 5000);
}

// Find bedste gruppering (bruger nu inputfelter for fordeling)

function findBedsteGruppeinddelingMedFordeling(elever, antal2, antal3, antal4, maxIter = 1000) {
  return fordelEleverMedPoint(elever, antal2, antal3, antal4, maxIter);
}

// Hjælpefunktion: Returner relation mellem to elever i samme gruppe
function relation(a, b) {
  const aNavn = normNavn(a.navn);
  const bNavn = normNavn(b.navn);
  const aØnsker = a.ønsker.map(normNavn);
  const aFravalg = a.fravalg.map(normNavn);
  const bØnsker = b.ønsker.map(normNavn);

  if (aFravalg.includes(bNavn)) return "minus";
  if (aØnsker.includes(bNavn) && bØnsker.includes(aNavn)) return "doubleplus";
  if (aØnsker.includes(bNavn)) return "plus";
  return "";
}

document.getElementById("lav-grupper-btn").addEventListener("click", () => {
  const elever = hentEleverFraTabel();

  // Hent værdier fra inputfelter
  const groupInputs = document.querySelectorAll('.group-settings input[type="number"]');
  const antal2 = parseInt(groupInputs[0].value, 10) || 0;
  const antal3 = parseInt(groupInputs[1].value, 10) || 0;
  const antal4 = parseInt(groupInputs[2].value, 10) || 0;

  const ønsketAntal = antal2 * 2 + antal3 * 3 + antal4 * 4;
  if (elever.length === 0) {
    alert("Indtast mindst en elev med navn.");
    return;
  }
  if (ønsketAntal < elever.length) {
    alert("Der er flere elever end der er plads til i de ønskede grupper. Tilføj flere grupper eller større grupper.");
    return;
  }


  // Kør mange iterationer for at finde mere optimal løsning
  const maxIter = 100000;
  const resultat = findBedsteGruppeinddelingMedFordeling(elever, antal2, antal3, antal4, maxIter);

  // Vis resultat i DOM med farver og statistik
  const container = document.getElementById("gruppe-resultat");
  if (!resultat.grupper || resultat.grupper.length === 0) {
    container.innerHTML = "<div>Ingen gyldig gruppeinddeling fundet (pga. fravalg eller for få grupper).</div>";
    return;
  }
  let html = `<div><strong>Bedste score:</strong> ${resultat.score}</div>`;
  html += `<div>Opfyldte ønsker: <strong>${resultat.ønskerOpfyldt}</strong> &nbsp; | &nbsp; Gensidige ønsker: <strong>${resultat.gensidige}</strong> &nbsp; | &nbsp; Undgåede fravalg: <strong>${resultat.fravalgUndgået}</strong></div>`;
  html += "<div style='margin-top:10px'>";
  resultat.grupper.forEach((gruppe, i) => {
    html += `<div style=\"margin-bottom:10px;\"><strong>Gruppe ${i + 1}:</strong> `;
    gruppe.forEach((elev, idx) => {
      let rel = "";
      for (let j = 0; j < gruppe.length; j++) {
        if (j === idx) continue;
        const r = relation(elev, gruppe[j]);
        if (r === "minus") { rel = "minus"; break; }
        if (r === "doubleplus") rel = "doubleplus";
        else if (r === "plus" && rel !== "doubleplus") rel = "plus";
      }
      let color = "";
      if (rel === "doubleplus") color = "background:#4be04b;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;font-weight:bold;";
      else if (rel === "plus") color = "background:#b6f5b6;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
      else if (rel === "minus") color = "background:#ffb6b6;color:#a80000;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
      else color = "background:#eee;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
      html += `<span style=\"${color}\">${elev.navn}</span>`;
    });
    html += `</div>`;
  });
  html += "</div>";
  container.innerHTML = html;
});
