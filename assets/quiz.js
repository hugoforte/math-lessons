// Multiple-choice quiz with immediate feedback.
// Usage: mountQuiz(containerElement, [{ q, choices: [...], answer: index, why }]).
// One attempt per question so the running score stays honest.
// Math inside \( \) or \[ \] is rendered with KaTeX auto-render, which the page must load first.
function mountQuiz(container, items) {
  let answered = 0;
  let right = 0;
  const score = document.createElement("div");
  score.className = "quiz-score";

  items.forEach((item, i) => {
    const box = document.createElement("div");
    box.className = "quiz-item";
    box.innerHTML = `
      <p class="quiz-q"><span class="quiz-num">${i + 1}.</span> ${item.q}</p>
      <div class="quiz-choices">${item.choices.map((c, j) => `<button type="button" data-j="${j}">${c}</button>`).join("")}</div>
      <div class="quiz-why"></div>`;
    const buttons = [...box.querySelectorAll("button")];
    const why = box.querySelector(".quiz-why");

    buttons.forEach(btn => btn.addEventListener("click", () => {
      const picked = Number(btn.dataset.j);
      const correct = picked === item.answer;
      buttons.forEach(b => (b.disabled = true));
      buttons[item.answer].classList.add("right");
      if (!correct) btn.classList.add("wrong");
      why.innerHTML = `<span class="${correct ? "verdict-right" : "verdict-wrong"}">${correct ? "Yes." : "Not quite."}</span> ${item.why}`;
      why.classList.add("show");
      renderMath(why);
      answered++;
      if (correct) right++;
      score.textContent = `Score: ${right} / ${answered}` + (answered === items.length ? " — done!" : "");
    }));

    container.appendChild(box);
  });

  container.appendChild(score);
  renderMath(container);
}

// Lessons load this file, so it also renders the math in the lesson body.
document.addEventListener("DOMContentLoaded", () => renderMath(document.body));

function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
    });
  }
}
