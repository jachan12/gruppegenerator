// Gruppegenerator med ønsker/fravalg og pointscore
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function normNavn(navn) {
  return navn.trim().toLowerCase();
}

function hentEleverFraTabel() {
  const elever = [];
  const tbody = document.getElementById("elev-tabel");
  const rækker = tbody.querySelectorAll("tr");
  rækker.forEach(række => {
    const inputs = række.querySelectorAll("input[type=text]");
    if (inputs.length < 6) return;
    const navn = inputs[0].value.trim();
    if (!navn) return;
    const ønsker = [inputs[1].value.trim(), inputs[2].value.trim(), inputs[3].value.trim()].filter(s => s !== "");
    const fravalg = [inputs[4].value.trim(), inputs[5].value.trim()].filter(s => s !== "");
    elever.push({ navn, ønsker, fravalg });
  });
  return elever;
}

function lavBedsteGruppeFordeling(elever, antal2, antal3, antal4, antal5 = 0) {
  let sizes = [
    ...Array(antal2).fill(2),
    ...Array(antal3).fill(3),
    ...Array(antal4).fill(4),
    ...Array(antal5).fill(5)
  ];
  let bestScore = -Infinity;
  let bestGrupper = null;
  let bestFarver = null;
  let bestAltGreen = -1;
  let bestAltGrupper = null;
  let bestAltFarver = null;
  let bestAltGreenList = [];
  let hvideNavne = [];
  let firstFarver = null;
  let firstGrupper = null;
  for (let attempt = 0; attempt < 2000; attempt++) {
    let eleverRest = [...elever];
    shuffle(eleverRest);
    let grupper = [];
    let brugt = new Set();
    for (let s of sizes) {
  let sizes = [
    ...Array(antal2).fill(2),
    ...Array(antal3).fill(3),
    ...Array(antal4).fill(4),
    ...Array(antal5).fill(5)
  ];
  let bestScore = -Infinity;
  let bestGrupper = null;
  let bestFarver = null;
  let bestAltGreen = -1;
  let bestAltGrupper = null;
  let bestAltFarver = null;
  let bestAltGreenList = [];
  let hvideNavne = [];
  let firstFarver = null;
  let firstGrupper = null;
  for (let attempt = 0; attempt < 1000; attempt++) {
    let eleverRest = [...elever];
    shuffle(eleverRest);
    let grupper = [];
    let brugt = new Set();
    for (let s of sizes) {
      // Start med tilfældig elev der ikke er brugt
      let startElev = eleverRest.find(e => !brugt.has(e.navn));
      if (!startElev) break;
      let gruppe = [startElev];
      brugt.add(startElev.navn);

      // 1. Prøv at finde et gensidigt ønske som næste medlem
      let mutualCandidates = startElev.ønsker
        .map(onavn => eleverRest.find(e => normNavn(e.navn) === normNavn(onavn) && !brugt.has(e.navn)))
        .filter(e => e && e.ønsker.map(normNavn).includes(normNavn(startElev.navn)));
      if (mutualCandidates.length > 0 && gruppe.length < s) {
        let valgt = mutualCandidates[Math.floor(Math.random() * mutualCandidates.length)];
        gruppe.push(valgt);
        brugt.add(valgt.navn);
      } else {
        // 2. Ellers tilføj et ensidigt ønske hvis muligt
        let ønskerKandidater = startElev.ønsker
          .map(onavn => eleverRest.find(e => normNavn(e.navn) === normNavn(onavn) && !brugt.has(e.navn)))
          .filter(Boolean);
        if (ønskerKandidater.length > 0 && gruppe.length < s) {
          let valgt = ønskerKandidater[Math.floor(Math.random() * ønskerKandidater.length)];
          gruppe.push(valgt);
          brugt.add(valgt.navn);
        }
      }

      // Fyld op med elever der bedst matcher ønsker/fravalg
      while (gruppe.length < s) {
        let kandidater = eleverRest.filter(e =>
          !brugt.has(e.navn) &&
          !gruppe.some(g => g.fravalg.map(normNavn).includes(normNavn(e.navn))) &&
          !e.fravalg.map(normNavn).some(f => gruppe.map(g => normNavn(g.navn)).includes(f))
        );
        // Prioriter dem der er ønsket af nogen i gruppen
        let ønskede = kandidater.filter(e => gruppe.some(g => g.ønsker.map(normNavn).includes(normNavn(e.navn))));
        let valgt = null;
        if (ønskede.length > 0) valgt = ønskede[Math.floor(Math.random() * ønskede.length)];
        else if (kandidater.length > 0) valgt = kandidater[Math.floor(Math.random() * kandidater.length)];
        else break;
        gruppe.push(valgt);
        brugt.add(valgt.navn);
      }
      grupper.push(gruppe);
    }
    // Fordel evt. resterende elever rundt
    let rest = eleverRest.filter(e => !brugt.has(e.navn));
    let g = 0;
    while (rest.length > 0 && grupper.length > 0) {
      grupper[g % grupper.length].push(rest.shift());
      g++;
    }
    // Scoring og farver
    let { score, farver } = beregnScoreOgFarver(grupper);

    // Første gang: find listen af hvide navne fra bedste løsning
    if (firstFarver === null) {
      firstFarver = farver.map(f => f.slice());
      firstGrupper = grupper.map(gr => gr.slice());
      let hvide = [];
      firstGrupper.forEach((gruppe, gi) => {
        gruppe.forEach((elev, ei) => {
          if (firstFarver[gi][ei] === "") hvide.push(normNavn(elev.navn));
        });
      });
      hvideNavne = hvide;
    }

    // Alternativ: hvor mange af de "hvide" fra bedste løsning bliver grøn/mørkegrøn her?
    let altGreen = 0;
    let altGreenList = [];
    grupper.forEach((gruppe, gi) => {
      gruppe.forEach((elev, ei) => {
        if (hvideNavne.includes(normNavn(elev.navn)) && (farver[gi][ei] === "grøn" || farver[gi][ei] === "mørkegrøn")) {
          altGreen++;
          altGreenList.push(elev.navn);
        }
      });
    });
    if (altGreen > bestAltGreen || (altGreen === bestAltGreen && score > (bestAltGrupper ? beregnScoreOgFarver(bestAltGrupper).score : -Infinity))) {
      bestAltGreen = altGreen;
      bestAltGrupper = grupper.map(gr => gr.slice());
      bestAltFarver = farver.map(f => f.slice());
      bestAltGreenList = altGreenList.slice();
    }
    if (score > bestScore) {
      bestScore = score;
      bestGrupper = grupper.map(gr => gr.slice());
      bestFarver = farver.map(f => f.slice());
    }
  }
  return { grupper: bestGrupper, score: bestScore, farver: bestFarver, altGrupper: bestAltGrupper, altFarver: bestAltFarver, altGreen: bestAltGreen, altGreenList: bestAltGreenList };
      g++;
    }
    // Scoring og farver
    let { score, farver } = beregnScoreOgFarver(grupper);
    // Tæl hvor mange grupper har mindst én grøn/mørkegrøn
    let greenGroups = 0;
    for (let i = 0; i < farver.length; i++) {
      if (farver[i].some(f => f === "grøn" || f === "mørkegrøn")) greenGroups++;
    }
    if (greenGroups > bestGreenGroups || (greenGroups === bestGreenGroups && score > (bestGreenGrupper ? beregnScoreOgFarver(bestGreenGrupper).score : -Infinity))) {
      bestGreenGroups = greenGroups;
      bestGreenGrupper = grupper.map(gr => gr.slice());
      bestGreenFarver = farver.map(f => f.slice());
    }
    if (score > bestScore) {
      bestScore = score;
      bestGrupper = grupper.map(gr => gr.slice());
      bestFarver = farver.map(f => f.slice());
    }
  }
  return { grupper: bestGrupper, score: bestScore, farver: bestFarver, greenGrupper: bestGreenGrupper, greenFarver: bestGreenFarver, greenGroups: bestGreenGroups };
}

function beregnScoreOgFarver(grupper) {
  let score = 0;
  let farver = [];
  grupper.forEach((gruppe, gi) => {
    farver[gi] = [];
    for (let i = 0; i < gruppe.length; i++) {
      let elev = gruppe[i];
      let elevNavn = normNavn(elev.navn);
      let elevØnsker = elev.ønsker.map(normNavn);
      let elevFravalg = elev.fravalg.map(normNavn);
      let elevScore = 0;
      let elevFarve = "";
      let harFravalg = false;
      let mutual = false;
      for (let j = 0; j < gruppe.length; j++) {
        if (i === j) continue;
        let anden = gruppe[j];
        let andenNavn = normNavn(anden.navn);
        let andenØnsker = anden.ønsker.map(normNavn);
        if (elevFravalg.includes(andenNavn) || anden.fravalg.map(normNavn).includes(elevNavn)) {
          harFravalg = true;
        }
        if (elevØnsker.includes(andenNavn) && andenØnsker.includes(elevNavn)) {
          elevScore += 2; // +1 til hver
          mutual = true;
        } else if (elevØnsker.includes(andenNavn)) {
          elevScore += 1;
        }
      }
      if (harFravalg) {
        elevScore -= 10;
        elevFarve = "rød";
      } else if (mutual) {
        elevFarve = "mørkegrøn";
      } else if (elevScore > 0) {
        elevFarve = "grøn";
      }
      score += elevScore;
      farver[gi][i] = elevFarve;
    }
  });
  return { score, farver };
}

document.getElementById("lav-grupper-btn").addEventListener("click", () => {
  const container = document.getElementById("gruppe-resultat");
  // Gem nuværende grupper-output
  const oldHtml = container.innerHTML;
  // Vis loading bar ovenpå gamle grupper
  container.innerHTML = `<div id='loading-bar' style='max-width:340px;width:90vw;background:linear-gradient(90deg,#e0eafc,#cfdef3);border-radius:12px;height:28px;position:relative;margin:0 auto 18px auto;box-shadow:0 2px 8px #0001;overflow:hidden;'>
    <div id='loading-progress' style='background:linear-gradient(90deg,#4ecb6e 0%,#5b9bd5 100%);height:100%;width:0%;border-radius:12px;transition:width 0.4s cubic-bezier(.4,2,.6,1);box-shadow:0 1px 4px #4ecb6e44;'></div>
    <span id='loading-text' style='position:absolute;left:50%;top:0;transform:translateX(-50%);color:#185c18;font-weight:600;letter-spacing:1px;line-height:28px;font-size:1.08em;'>Beregner grupper...</span>
  </div>` + oldHtml;

  setTimeout(() => {
    const elever = hentEleverFraTabel();
    const groupInputs = document.querySelectorAll('.group-settings input[type="number"]');
    const antal2 = parseInt(groupInputs[0].value, 10) || 0;
    const antal3 = parseInt(groupInputs[1].value, 10) || 0;
    const antal4 = parseInt(groupInputs[2].value, 10) || 0;
    const antal5 = parseInt(groupInputs[3].value, 10) || 0;
    const ønsketAntal = antal2 * 2 + antal3 * 3 + antal4 * 4+ antal5 * 5;
    if (elever.length === 0) {
      const fejlBesked = document.getElementById("fejl-besked");
      fejlBesked.textContent = "Indtast mindst en elev med navn.";
      container.innerHTML = oldHtml;
      return;

    }
    if (ønsketAntal < elever.length) {
      const fejlBesked = document.getElementById("fejl-besked");
      fejlBesked.textContent = "Der er flere elever end der er plads til i de ønskede grupper.";
      container.innerHTML = oldHtml;

    }

    // Loading bar animation (kør hele vejen til 100%)
    let progress = 0;
    let max = 1000;
    let bar = document.getElementById('loading-progress');
    let interval = setInterval(() => {
      progress += Math.floor(Math.random()*30)+10;
      let pct = Math.min(100, Math.round((progress / max) * 100));
      if (bar) bar.style.width = pct + '%';
      if (progress >= max) {
        if (bar) bar.style.width = '100%';
        clearInterval(interval);
      }
    }, 18);

    // Beregn grupper (synkront)
    setTimeout(() => {
      // Vent til loadingbar er færdig
      setTimeout(() => {
        const resultat = lavBedsteGruppeFordeling(elever, antal2, antal3, antal4, antal5);
        if (!resultat.grupper || resultat.grupper.length === 0) {
          container.innerHTML = "<div>Ingen gyldig gruppeinddeling fundet.</div>";
          return;
        }
        // Venstre: bedste score, højre: alternativ hvor flest "hvide" fra optimal får opfyldt ønske
        let html = `<div style='display:flex;gap:32px;flex-wrap:wrap;justify-content:center;'>`;
        // Bedste score
        html += `<div style='min-width:320px;max-width:420px;'><div style="display:flex;align-items:center;gap:10px;"><strong>Bedste score:</strong> <span style='color:#185c18;font-weight:bold;'>${resultat.score}</span> <button id="copy-best-btn" class="copy-btn" style="margin-left:6px;vertical-align:middle;display:inline-flex;align-items:center;gap:5px;font-size:0.93em;padding:3px 10px 3px 8px;border-radius:12px;border:none;background:linear-gradient(90deg,#4ecb6e 0%,#5b9bd5 100%);color:#fff;font-weight:600;box-shadow:0 1.5px 4px #4ecb6e22,0 1px 0 #fff3 inset;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;"><span style="font-size:0.97em;letter-spacing:0.2px;">Kopier</span> <span id="copy-best-emoji" style="font-size:1.05em;">📋</span></button></div>`;
        html += "<div style='margin-top:10px'>";
        resultat.grupper.forEach((gruppe, i) => {
          html += `<div style=\"margin-bottom:10px;\"><strong>Gruppe ${i + 1}:</strong> `;
          gruppe.forEach((elev, idx) => {
            let farve = resultat.farver[i][idx];
            let color = "background:#eee;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
            if (farve === "grøn") color = "background:#b6f5b6;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
            if (farve === "mørkegrøn") color = "background:#4ecb6e;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;font-weight:bold;";
            if (farve === "rød") color = "background:#ffb6b6;color:#a80000;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
            html += `<span style=\"${color}\">${elev.navn}</span>`;
          });
          html += `</div>`;
        });
        html += "</div></div>";
        // Alternativ løsning
        if (resultat.altGrupper) {
          // Beregn score for alternativ løsning
          let altScore = 0;
          if (resultat.altGrupper && resultat.altFarver) {
            altScore = beregnScoreOgFarver(resultat.altGrupper).score;
          }
          html += `<div style='min-width:320px;max-width:420px;'>`;
          html += `<div style="display:flex;align-items:center;gap:10px;"><strong>Alternativt:</strong> <span class="tooltip-container" tabindex="0" aria-label="Forklaring på alternativ løsning" style="margin-left:2px;outline:none;"><span style="font-size:1em;vertical-align:middle;position:relative;top:-1px;">🛈</span><span class="tooltip-text">Denne løsning forsøger<br>at give flest mulige af de personer,<br>som ikke fik opfyldt et ønske i den<br>optimale løsning, opfyldt et ønske.</span></span> <span style='color:#185c18;font-weight:bold;'>${altScore}</span> <button id="copy-alt-btn" class="copy-btn" style="margin-left:6px;vertical-align:middle;display:inline-flex;align-items:center;gap:5px;font-size:0.93em;padding:3px 10px 3px 8px;border-radius:12px;border:none;background:linear-gradient(90deg,#4ecb6e 0%,#5b9bd5 100%);color:#fff;font-weight:600;box-shadow:0 1.5px 4px #4ecb6e22,0 1px 0 #fff3 inset;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;"><span style="font-size:0.97em;letter-spacing:0.2px;">Kopier</span> <span id="copy-alt-emoji" style="font-size:1.05em;">📋</span></button></div>`;
          html += "<div style='margin-top:10px'>";
          resultat.altGrupper.forEach((gruppe, i) => {
            html += `<div style=\"margin-bottom:10px;\"><strong>Gruppe ${i + 1}:</strong> `;
            gruppe.forEach((elev, idx) => {
              let farve = resultat.altFarver[i][idx];
              let color = "background:#eee;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
              if (farve === "grøn") color = "background:#b6f5b6;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
              if (farve === "mørkegrøn") color = "background:#4ecb6e;color:#185c18;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;font-weight:bold;";
              if (farve === "rød") color = "background:#ffb6b6;color:#a80000;border-radius:6px;padding:2px 8px;margin:0 2px;display:inline-block;";
              // Marker "hvide" der nu er grønne
              let extra = "";
              if (resultat.altGreenList && resultat.altGreenList.includes(elev.navn)) extra = ' outline:2px solid #4ecb6e; box-shadow:0 0 0 2px #4ecb6e55;';
              html += `<span style=\"${color}${extra}\">${elev.navn}</span>`;
            });
            html += `</div>`;
          });
          html += "</div></div>";
        }
        html += "</div>";
        container.innerHTML = html;

        // --- Kopier-knap funktionalitet ---
        function grupperTilTabel(grupper) {
          let rows = grupper.map((gruppe, i) => {
            return [
              `Gruppe ${i + 1}`,
              ...gruppe.map(e => e.navn)
            ];
          });
          // Find max antal medlemmer
          let maxLen = Math.max(...rows.map(r => r.length));
          // Pad alle rækker til samme længde
          rows = rows.map(r => r.concat(Array(maxLen - r.length).fill("")));
          // Byg tab-separeret tekst
          return rows.map(r => r.join("\t")).join("\n");
        }

        function setupCopyBtn(btnId, emojiId, grupper) {
          const btn = document.getElementById(btnId);
          const emoji = document.getElementById(emojiId);
          if (!btn || !emoji) return;
          btn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(grupperTilTabel(grupper));
              emoji.textContent = "✅";
              setTimeout(() => { emoji.textContent = "📋"; }, 1200);
            } catch (e) {
              emoji.textContent = "❌";
              setTimeout(() => { emoji.textContent = "📋"; }, 1200);
            }
          });
        }
        setupCopyBtn("copy-best-btn", "copy-best-emoji", resultat.grupper);
        if (resultat.altGrupper) setupCopyBtn("copy-alt-btn", "copy-alt-emoji", resultat.altGrupper);
      }, Math.max(0, 1000-progress));
    }, 200);
  }, 100);
});
