/**
 * PALETA DE COMANDOS
 * Abre a busca rápida, filtra ações e permite navegar pelo site usando teclado.
 */

(() => {
  const palette = document.querySelector("#commandPalette");
  const input = document.querySelector("#commandInput");
  const trigger = document.querySelector("#commandTrigger");
  const items = [...document.querySelectorAll(".command-item")];
  let filtered = items;
  let activeIndex = 0;
  if (!palette || !input || !trigger) return;
  const setActive = (index) => {
    if (!filtered.length) return;
    activeIndex = (index + filtered.length) % filtered.length;
    items.forEach((item) => item.classList.remove("active"));
    filtered[activeIndex].classList.add("active");
    filtered[activeIndex].scrollIntoView({
      block: "nearest",
    });
  };
  const close = () => {
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
    input.value = "";
    filtered = items;
    items.forEach((item) => (item.style.display = ""));
    setActive(0);
  };
  const open = () => {
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    input.value = "";
    filtered = items;
    items.forEach((item) => (item.style.display = ""));
    setActive(0);
    requestAnimationFrame(() => input.focus());
  };
  const execute = (item) => {
    if (!item) return; // Mantém a última ação selecionada visualmente identificada.
    items.forEach((entry) => entry.classList.remove("selected"));
    item.classList.add("selected");
    if (item.dataset.command === "go") {
      document.querySelector(item.dataset.target)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    close();
  };
  trigger.addEventListener("click", open);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      palette.classList.contains("open") ? close() : open();
      return;
    }
    if (!palette.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      execute(filtered[activeIndex]);
    }
  });
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    filtered = items.filter((item) =>
      item.textContent.toLowerCase().includes(query),
    );
    items.forEach(
      (item) => (item.style.display = filtered.includes(item) ? "" : "none"),
    );
    setActive(0);
  });
  items.forEach((item) => item.addEventListener("click", () => execute(item)));
  palette.addEventListener("click", (event) => {
    if (event.target === palette) close();
  });
})();
