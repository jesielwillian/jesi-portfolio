/**
 * CONTROLADOR PRINCIPAL DA INTERFACE
 * Reúne navegação, tema, animações, filtros, modal, FAQ, formulário e rolagem.
 *
 * Índice:
 * 01. Seletores e referências do DOM
 * 02. Menu responsivo
 * 03. Tema visual
 * 04. Animações de entrada
 * 05. Indicadores animados
 * 06. Busca e filtros de projetos
 * 07. Modal de projetos
 * 08. Perguntas frequentes
 * 09. Formulário de contato
 * 10. Eventos de rolagem e navegação ativa
 * 11. Efeito de brilho do cursor
 * 12. Atalho global de teclado
 */

/* -------------------------------------------------------------------------
   1. ATALHOS & SELEÇÃO DE ELEMENTOS
   ------------------------------------------------------------------------- */
/** Atalho para document.querySelector. */
const $ = (selector, scope = document) => scope.querySelector(selector);
/** Atalho para document.querySelectorAll (já convertido em array). */
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const backTop = $("#backTop");
const contactForm = $("#contactForm");
const cursorGlow = $(".cursor-glow");
const header = $("#header");
const menuToggle = $("#menuToggle");
const modal = $("#projectModal");
const modalTitle = $("#modalTitle");
const navMenu = $("#navMenu");
const themeToggle = $("#themeToggle");
const toast = $("#toast");
// Elemento que leva o visitante à seção Sobre.
const scrollDown = $(".scroll-down");
const aboutSection = $("#sobre");
/* -------------------------------------------------------------------------
   2. MENU MOBILE (TOGGLE)
   Abre/fecha o painel de navegação, anima o ícone (hambúrguer -> X),
   bloqueia o scroll do body e fecha ao clicar fora, no link ou com Esc.
   ------------------------------------------------------------------------- */
/**
 * Define o estado do menu mobile.
 * @param {boolean} open true para abrir, false para fechar.
 */
function setMenu(open) {
  if (!navMenu || !menuToggle) return;
  navMenu.classList.toggle("open", open);
  menuToggle.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("menu-open", open);
}
/** Verifica se o menu está aberto. */
const isMenuOpen = () => Boolean(navMenu?.classList.contains("open"));
menuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenu(!isMenuOpen());
});
// Fecha o menu após a seleção de uma seção.
$$(".nav-link").forEach((link) =>
  link.addEventListener("click", () => setMenu(false)),
);
// Fecha o menu quando o usuário clica fora dele.
document.addEventListener("click", (event) => {
  if (
    isMenuOpen() &&
    !navMenu.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    setMenu(false);
  }
});
// Garante que o menu mobile seja fechado ao voltar ao desktop.
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) setMenu(false);
});
/* -------------------------------------------------------------------------
   3. TEMA CLARO / ESCURO
   O tema escolhido fica salvo no localStorage.
   ------------------------------------------------------------------------- */
/**
 * Aplica o tema na página e atualiza o ícone do botão.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light", light);
  if (themeToggle) {
    themeToggle.innerHTML = light
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
}
// O acesso ao armazenamento pode falhar em alguns modos de navegação
// (por exemplo, políticas restritivas para arquivos locais).
let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("theme") === "light" ? "light" : "dark";
} catch (error) {
  // Mantém o tema padrão sem interromper o restante da página.
}
applyTheme(savedTheme);
themeToggle?.addEventListener("click", () => {
  const theme = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // A alternância visual continua funcionando mesmo sem persistência.
  }
});
/* -------------------------------------------------------------------------
   4. ANIMAÇÕES DE ENTRADA (REVEAL)
   Adiciona a classe .show quando o elemento entra na viewport.
   ------------------------------------------------------------------------- */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  $$(".reveal").forEach((element) => revealObserver.observe(element));
  // Só esconde elementos depois de confirmar que a animação está pronta.
  document.body.classList.add("reveal-ready");
} else {
  // Navegadores sem IntersectionObserver exibem todo o conteúdo normalmente.
  $$(".reveal").forEach((element) => element.classList.add("show"));
}
/* -------------------------------------------------------------------------
   5. CONTADORES DAS ESTATÍSTICAS
   Anima os números de 0 até o valor de data-count (uma única vez).
   ------------------------------------------------------------------------- */
const counters = $$(".stat strong");
let countersStarted = false;
/**
 * Anima um contador até o valor final.
 * @param {HTMLElement} counter
 */
function animateCounter(counter) {
  const target = Number(counter.dataset.count);
  const step = Math.ceil(target / 60);
  let value = 0;
  // update: atualiza a interface.
  const update = () => {
    value += step;
    if (value >= target) {
      counter.textContent = `${target}+`;
      return;
    }
    counter.textContent = value;
    requestAnimationFrame(update);
  };
  update();
}
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      if (countersStarted || !entries.some((entry) => entry.isIntersecting))
        return;
      countersStarted = true;
      counters.forEach(animateCounter);
    },
    { threshold: 0.5 },
  );
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => {
    counter.textContent = `${Number(counter.dataset.count) || 0}+`;
  });
}
/* -------------------------------------------------------------------------
   6. FILTRO DE PROJETOS
   ------------------------------------------------------------------------- */
const filterButtons = $$(".filters button");
const projectSearch = document.querySelector("#projectSearch");
const projects = $$(".project");
let activeProjectFilter = "all";
  // Aplica simultaneamente o filtro de categoria e a busca textual.
const filterProjects = () => {
  const query = projectSearch?.value.trim().toLowerCase() || "";
  projects.forEach((project) => {
    const matchesCategory =
      activeProjectFilter === "all" ||
      project.dataset.category === activeProjectFilter;
    const matchesSearch =
      !query || project.textContent.toLowerCase().includes(query);
    project.style.display = matchesCategory && matchesSearch ? "block" : "none";
  });
};
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeProjectFilter = button.dataset.filter;
    filterProjects();
  });
});
projectSearch?.addEventListener("input", filterProjects);
/* -------------------------------------------------------------------------
   7. MODAL DE PROJETO
   O conteúdo do modal é preenchido em js/modal.js.
   ------------------------------------------------------------------------- */
/** Fecha o modal de projeto. */
const closeModal = () => modal?.classList.remove("active");
$$(".view-project").forEach((button) => {
  button.addEventListener("click", () => {
    if (modalTitle) modalTitle.textContent = button.dataset.title;
    modal?.classList.add("active");
  });
});
$(".modal-close")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
/* -------------------------------------------------------------------------
   8. FAQ (ACCORDION)
   ------------------------------------------------------------------------- */
$$(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    $$(".faq-item").forEach((faq) => {
      if (faq !== item) faq.classList.remove("open");
    });
    item.classList.toggle("open");
  });
});
/* -------------------------------------------------------------------------
   9. FORMULÁRIO DE CONTATO
   Envio simulado com feedback visual (loading + toast).
   ------------------------------------------------------------------------- */
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
  setTimeout(() => {
    contactForm.reset();
    button.disabled = false;
    button.innerHTML =
      'Enviar mensagem <i class="fa-solid fa-paper-plane"></i>';
    toast?.classList.add("active");
    setTimeout(() => toast?.classList.remove("active"), 3000);
  }, 1000);
});
/* -------------------------------------------------------------------------
   10. SCROLL: HEADER, BOTÃO VOLTAR AO TOPO, LINK ATIVO E SCROLL DOWN
   ------------------------------------------------------------------------- */
const sections = $$("section[id]");
window.addEventListener("scroll", () => {
  const position = window.scrollY; // Exibe o controle de retorno ao topo após a rolagem.
  backTop?.classList.toggle("show", position > 500); // Realça o cabeçalho após o início da rolagem.
  if (header) {
    header.style.borderBottomColor =
      position > 20 ? "var(--border)" : "transparent";
  }
  // Mantém o link da navegação sincronizado com a seção visível.
  let current = "";
  sections.forEach((section) => {
    if (position >= section.offsetTop - 150) {
      current = section.id;
    }
  });
  $$(".nav-link").forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`,
    );
  });
});
// Scroll suave até a seção "Sobre mim", compensando o header fixo.
scrollDown?.addEventListener("click", (event) => {
  if (!aboutSection) return;
  event.preventDefault();
  const headerHeight = header?.offsetHeight ?? 0;
  const targetPosition =
    aboutSection.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    20;
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth",
  });
});
// Exibe o controle de retorno ao topo após a rolagem.
backTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
/* -------------------------------------------------------------------------
   11. BRILHO QUE ACOMPANHA O CURSOR
   ------------------------------------------------------------------------- */
window.addEventListener("mousemove", (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});
/* -------------------------------------------------------------------------
   ATALHO GLOBAL: ESC FECHA MENU E MODAL
   ------------------------------------------------------------------------- */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeModal();
  setMenu(false);
});
