// Full-length practice test, graded all at once (unlike quiz.js, which gives feedback per question).
// Usage: mountTest(container, items, { minutes, checkpoints: [{ question, minute }] }).
// Each item: { skill, stem, choices: [4 strings], key: "A".."D", explain, grid? }.
// Set grid: true to lay picture choices out two by two.
// Needs quiz.js loaded first for renderMath.
function mountTest(container, items, options = {}) {
  const LETTERS = ["A", "B", "C", "D"];
  const minutes = options.minutes || 45;
  const checkpoints = options.checkpoints || [];

  const sections = items.map((item, i) => {
    const sec = document.createElement("section");
    sec.className = "test-q";
    sec.innerHTML = `
      <h3><span>Question ${i + 1}</span><span class="test-skill">${item.skill}</span></h3>
      <div class="test-stem">${item.stem}</div>
      <ul class="test-choices${item.grid ? " grid" : ""}">
        ${item.choices.map((c, j) => `
          <li><label><input type="radio" name="tq${i}" value="${LETTERS[j]}">
            <span class="test-letter">${LETTERS[j]}</span><span>${c}</span></label></li>`).join("")}
      </ul>
      <div class="test-work">Work space</div>
      <div class="test-after">
        <div class="test-result"></div>
        <details><summary>Show explanation</summary>
          <div class="test-explain"><p><strong>Answer: ${item.key}.</strong></p>${item.explain}</div>
        </details>
      </div>`;
    container.appendChild(sec);
    return sec;
  });

  const bar = document.createElement("div");
  bar.className = "test-bar no-print";
  bar.innerHTML = `
    <button type="button" class="test-check">Check answers</button>
    <button type="button" class="test-reset secondary">Start over</button>
    <button type="button" class="test-timer secondary">Start ${minutes}-minute timer</button>
    <span class="test-clock"></span>
    <span class="test-score"></span>`;
  container.appendChild(bar);

  const summary = document.createElement("div");
  summary.className = "test-summary";
  container.appendChild(summary);

  const answeredCount = () => sections.filter(sec => sec.querySelector("input:checked")).length;

  // Timer: counts up, shows the pacing checkpoints, and notes how far the student got when time ran out.
  const clock = bar.querySelector(".test-clock");
  const timerBtn = bar.querySelector(".test-timer");
  let started = null, ticker = null, answeredAtTimeUp = null;
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function tick() {
    const s = Math.floor((Date.now() - started) / 1000);
    const next = checkpoints.find(c => s < c.minute * 60);
    const hint = next ? ` · aim to reach Q${next.question} by ${next.minute}:00` : "";
    if (s >= minutes * 60 && answeredAtTimeUp === null) answeredAtTimeUp = answeredCount();
    clock.textContent = s >= minutes * 60
      ? `Time's up (${fmt(s)}). You had answered ${answeredAtTimeUp}. Finish, then check.`
      : `${fmt(s)} of ${minutes}:00${hint}`;
    clock.classList.toggle("over", s >= minutes * 60);
  }
  function stopTimer() {
    clearInterval(ticker);
    ticker = null;
  }
  timerBtn.addEventListener("click", () => {
    if (ticker) return;
    started = Date.now();
    answeredAtTimeUp = null;
    ticker = setInterval(tick, 1000);
    tick();
    timerBtn.disabled = true;
  });

  bar.querySelector(".test-check").addEventListener("click", () => {
    if (ticker) {
      tick();
      stopTimer();
    }
    let right = 0;
    const bySkill = new Map();
    sections.forEach((sec, i) => {
      const key = items[i].key;
      const picked = sec.querySelector("input:checked");
      sec.querySelectorAll("label").forEach(label => {
        const v = label.querySelector("input").value;
        label.classList.toggle("right", v === key);
        label.classList.toggle("wrong", !!picked && v === picked.value && v !== key);
      });
      const ok = !!picked && picked.value === key;
      const res = sec.querySelector(".test-result");
      res.textContent = ok ? "Correct." : picked ? `Not quite. The answer is ${key}.` : `No answer. The answer is ${key}.`;
      res.className = "test-result " + (ok ? "ok" : "bad");
      if (ok) right++;
      const s = bySkill.get(items[i].skill) || { right: 0, total: 0, missed: [] };
      s.total++;
      if (ok) s.right++;
      else s.missed.push(i + 1);
      bySkill.set(items[i].skill, s);
    });
    container.classList.add("graded");
    const timing = answeredAtTimeUp !== null ? ` · ${answeredAtTimeUp} answered when time ran out` : "";
    bar.querySelector(".test-score").textContent = `Score: ${right} / ${items.length}${timing}`;
    const rows = [...bySkill].map(([skill, s]) =>
      `<tr class="${s.right === s.total ? "" : "miss"}"><td>${skill}</td><td>${s.right} / ${s.total}</td><td>${s.missed.map(n => "Q" + n).join(", ")}</td></tr>`).join("");
    summary.innerHTML = `<h2>Results by skill</h2>
      <table class="test-skills"><tr><th>Skill</th><th>Right</th><th>Missed</th></tr>${rows}</table>`;
  });

  bar.querySelector(".test-reset").addEventListener("click", () => {
    stopTimer();
    started = null;
    answeredAtTimeUp = null;
    timerBtn.disabled = false;
    clock.textContent = "";
    clock.classList.remove("over");
    container.querySelectorAll("input").forEach(i => (i.checked = false));
    container.querySelectorAll("label").forEach(l => l.classList.remove("right", "wrong"));
    container.querySelectorAll("details").forEach(d => (d.open = false));
    container.classList.remove("graded");
    bar.querySelector(".test-score").textContent = "";
    summary.innerHTML = "";
    window.scrollTo(0, 0);
  });

  renderMath(container);
}
