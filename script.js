function getCurrentElevCount() {
  return document.querySelectorAll("#elev-tabel tr").length;
}

// Funktion til at opdatere elevnumre efter sletning
function opdaterElevNumre() {
  const rows = document.querySelectorAll("#elev-tabel tr");
  rows.forEach((row, idx) => {
    const indexCell = row.querySelector(".student-index");
    if (indexCell) indexCell.textContent = idx + 1;
  });
}

// Funktion til at tilføje slet-knap til en række
function tilføjSletKnap(row) {
  const cell = document.createElement("td");
  cell.innerHTML = '<button class="remove-row" title="Slet elev" style="background:none;border:none;color:#d9534f;font-size:1.2em;cursor:pointer;">&#10005;</button>';
  row.appendChild(cell);
}

const ønskerBtn = document.getElementById("vis-ønsker");
const fravalgBtn = document.getElementById("vis-fravalg");

// Tilføj startklasser så kolonnerne er synlige fra start
document.body.classList.add("show-ønsker");
document.body.classList.add("show-fravalg");

// Start med rød baggrund og hvid tekst = "allerede tilføjet"
ønskerBtn.textContent = "Fjern ønsker";
ønskerBtn.style.background = "#ff5a5a";
ønskerBtn.style.color = "#fff";

fravalgBtn.textContent = "Fjern fravalg";
fravalgBtn.style.background = "#ff5a5a";
fravalgBtn.style.color = "#fff";

// Toggle-knap for ønsker
ønskerBtn.addEventListener("click", () => {
  document.body.classList.toggle("show-ønsker");
  const aktiv = document.body.classList.contains("show-ønsker");
  ønskerBtn.textContent = aktiv ? "Fjern ønsker" : "Tilføj ønsker";
  ønskerBtn.style.background = aktiv ? "#ff5a5a" : "#4ecb6e";
  ønskerBtn.style.color = aktiv ? "#fff" : "#185c18";
});

// Toggle-knap for fravalg
fravalgBtn.addEventListener("click", () => {
  document.body.classList.toggle("show-fravalg");
  const aktiv = document.body.classList.contains("show-fravalg");
  fravalgBtn.textContent = aktiv ? "Fjern fravalg" : "Tilføj fravalg";
  fravalgBtn.style.background = aktiv ? "#ff5a5a" : "#4ecb6e";
  fravalgBtn.style.color = aktiv ? "#fff" : "#185c18";
});


// Giv 'Tilføj elever' blå farve, så den matcher inputfeltet og skiller sig ud
const tilføjEleverBtn = document.getElementById("tilføj-elever");
if (tilføjEleverBtn) {
  tilføjEleverBtn.style.background = "linear-gradient(90deg,#5b9bd5,#4a90e2)";
  tilføjEleverBtn.style.color = "#fff";
  tilføjEleverBtn.style.fontWeight = "bold";
  tilføjEleverBtn.style.boxShadow = "0 1px 4px #4a90e233";
}

// Opdateret tilføj-elever så nye rækker får de rigtige klasser
document.getElementById("tilføj-elever").addEventListener("click", () => {
  const tableBody = document.getElementById("elev-tabel");
  const antal = parseInt(document.getElementById("antal-elever").value, 10);
  if (isNaN(antal) || antal < 1) return;

  let startIndex = getCurrentElevCount() + 1;
  for (let i = 0; i < antal; i++) {
    const row = document.createElement("tr");

    // Nummer-kolonne
    const indexCell = document.createElement("td");
    indexCell.className = "student-index";
    indexCell.textContent = startIndex + i;
    row.appendChild(indexCell);

    // Navn
    const navnCell = document.createElement("td");
    const navnInput = document.createElement("input");
    navnInput.type = "text";
    navnInput.placeholder = "Navn";
    navnCell.appendChild(navnInput);
    row.appendChild(navnCell);

    // Ønsker (skjult som standard)
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement("td");
      cell.className = "ønske-col";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Navn";
      cell.appendChild(input);
      row.appendChild(cell);
    }

    // Fravalg (skjult som standard)
    for (let j = 0; j < 2; j++) {
      const cell = document.createElement("td");
      cell.className = "fravalg-col";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Navn";
      cell.appendChild(input);
      row.appendChild(cell);
    }

    // Tilføj slet-knap
    tilføjSletKnap(row);

    tableBody.appendChild(row);
  }
});

// Event delegation for slet-knapper
document.getElementById("elev-tabel").addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("remove-row")) {
    const row = e.target.closest("tr");
    if (row) {
      row.remove();
      opdaterElevNumre();
    }
  }
});

// Tilføj slet-knap til eksisterende række ved load
window.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("elev-tabel");
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach(row => {
    // Undgå at tilføje flere slet-knapper hvis de allerede findes
    if (!row.querySelector(".remove-row")) {
      tilføjSletKnap(row);
    }
  });

  // Find øverste navn-felt
  const firstNavnInput = tableBody.querySelector("tr td:nth-child(2) input[type='text']");

  if (firstNavnInput) {
    firstNavnInput.addEventListener("paste", function (e) {
      const clipboard = e.clipboardData || window.clipboardData;
      const text = clipboard.getData("text");
      if (!text) return;

      // Split på linjeskift (Excel/Sheets kopier)
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length <= 1) return; // Hvis kun én linje, gør intet specielt

      e.preventDefault();

      // Tjek hvilke kolonner der er synlige
      const showØnsker = document.body.classList.contains("show-ønsker");
      const showFravalg = document.body.classList.contains("show-fravalg");
      // Antal kolonner der skal udfyldes pr. række
      let colCount = 1; // Navn
      if (showØnsker) colCount += 3;
      if (showFravalg) colCount += 2;

      // Parse linjer til arrays (split evt. på tab)
      const parsedLines = lines.map(line => line.split('\t'));

      // Sæt første række i nuværende felt og evt. flere kolonner
      let firstRow = parsedLines[0];
      this.value = firstRow[0] || "";
      let currentCell = this;
      let parentRow = this.closest("tr");
      // Udfyld evt. ønsker/fravalg i første række
      let cellIdx = 1;
      if (showØnsker) {
        for (let i = 0; i < 3; i++, cellIdx++) {
          const wishCell = parentRow.querySelector(`td.ønske-col:nth-of-type(${i+3}) input`);
          if (wishCell && firstRow[cellIdx] !== undefined) wishCell.value = firstRow[cellIdx];
        }
      }
      if (showFravalg) {
        for (let i = 0; i < 2; i++, cellIdx++) {
          const notCell = parentRow.querySelector(`td.fravalg-col:nth-of-type(${i+6}) input`);
          if (notCell && firstRow[cellIdx] !== undefined) notCell.value = firstRow[cellIdx];
        }
      }

      // Find eksisterende rækker
      let rows = Array.from(tableBody.querySelectorAll("tr"));

      // Tilføj flere rækker hvis nødvendigt
      while (rows.length < parsedLines.length) {
        const event = new Event("click");
        document.getElementById("antal-elever").value = 1;
        document.getElementById("tilføj-elever").dispatchEvent(event);
        rows = Array.from(tableBody.querySelectorAll("tr"));
      }

      // Sæt værdier i de efterfølgende rækker
      for (let i = 1; i < parsedLines.length; i++) {
        const row = rows[i];
        const values = parsedLines[i];
        // Navn
        const navnInput = row.querySelector("td:nth-child(2) input[type='text']");
        if (navnInput) navnInput.value = values[0] || "";
        let idx = 1;
        // Ønsker
        if (showØnsker) {
          const wishInputs = row.querySelectorAll("td.ønske-col input");
          for (let j = 0; j < wishInputs.length; j++, idx++) {
            if (values[idx] !== undefined) wishInputs[j].value = values[idx];
          }
        }
        // Fravalg
        if (showFravalg) {
          const notInputs = row.querySelectorAll("td.fravalg-col input");
          for (let j = 0; j < notInputs.length; j++, idx++) {
            if (values[idx] !== undefined) notInputs[j].value = values[idx];
          }
        }
      }
    });
  }
});

// Global paste-funktionalitet for alle inputfelter i tabellen
function handlePasteToTableInput(input, e) {
  const tableBody = document.getElementById("elev-tabel");
  const clipboard = e.clipboardData || window.clipboardData;
  const text = clipboard.getData("text");
  if (!text) return;

  // Split på linjeskift (Excel/Sheets kopier)
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length <= 1 && text.indexOf('\t') === -1) return; // Hvis kun én linje og ingen tabs, gør intet specielt

  e.preventDefault();

  // Tjek hvilke kolonner der er synlige
  const showØnsker = document.body.classList.contains("show-ønsker");
  const showFravalg = document.body.classList.contains("show-fravalg");

  // Parse linjer til arrays (split på tab)
  const parsedLines = lines.map(line => line.split('\t'));

  // Find startcelle (input) position
  const cell = input.closest("td");
  const row = input.closest("tr");
  const allRows = Array.from(tableBody.querySelectorAll("tr"));
  const rowIndex = allRows.indexOf(row);
  const allCells = Array.from(row.querySelectorAll("td input[type='text']"));
  const cellIndex = allCells.indexOf(input);

  // Tilføj flere rækker hvis nødvendigt
  while (allRows.length < rowIndex + parsedLines.length) {
    const event = new Event("click");
    document.getElementById("antal-elever").value = 1;
    document.getElementById("tilføj-elever").dispatchEvent(event);
    // Opdater allRows
    allRows.push(tableBody.querySelectorAll("tr")[allRows.length]);
  }

  // Udfyld celler
  for (let i = 0; i < parsedLines.length; i++) {
    const targetRow = allRows[rowIndex + i];
    if (!targetRow) continue;
    const targetInputs = Array.from(targetRow.querySelectorAll("td input[type='text']"));
    const values = parsedLines[i];
    for (let j = 0; j < values.length; j++) {
      // Find rigtig kolonne ift. synlige kolonner
      let colOffset = cellIndex + j;
      // Hvis kolonner er skjult, spring dem over
      let visibleInputs = Array.from(targetRow.querySelectorAll("td"))
        .filter(td => {
          if (td.classList.contains("ønske-col") && !showØnsker) return false;
          if (td.classList.contains("fravalg-col") && !showFravalg) return false;
          return td.querySelector("input[type='text']");
        })
        .map(td => td.querySelector("input[type='text']"));
      if (colOffset < visibleInputs.length) {
        visibleInputs[colOffset].value = values[j];
      }
    }
  }
}

// Event delegation: tilføj paste-handler til alle inputfelter i tabellen
document.getElementById("elev-tabel").addEventListener("paste", function(e) {
  const target = e.target;
  if (target && target.tagName === "INPUT" && target.type === "text") {
    handlePasteToTableInput(target, e);
  }
});
