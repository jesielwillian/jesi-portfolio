/**
 * INTERAÇÃO DA LINHA DO TEMPO
 * Cada experiência abre uma janela de detalhes; não há links externos.
 */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("experienceModal");
  if (!modal) return;

  const experiences = [
    {
      index: "EXPERIÊNCIA 01",
      period: "2026 — ATUAL",
      eyebrow: "EXPERIÊNCIA ATUAL · CONSTRUÇÃO E EVOLUÇÃO",
      title: "Senior Front-end Developer",
      company: "Projetos independentes",
      description: "Atuação na criação e evolução de experiências digitais, conectando interface, usabilidade e performance. O trabalho envolve transformar objetivos em páginas claras, responsivas e consistentes em diferentes dispositivos.",
      focus: ["Criação de interfaces e páginas responsivas", "Desenvolvimento de sites institucionais e landing pages", "Implementação e personalização de soluções WordPress"],
      skills: ["Front-end", "UI Design", "WordPress", "Responsividade"]
    },
    {
      index: "EXPERIÊNCIA 02",
      period: "2023 — 2025",
      eyebrow: "EVOLUÇÃO TÉCNICA · PRODUTO DIGITAL",
      title: "Front-end Developer",
      company: "Web Projects",
      description: "Etapa dedicada à construção de interfaces para a web e ao aprofundamento das práticas de desenvolvimento front-end. O foco esteve em criar experiências adaptáveis, organizar componentes e conectar interfaces a serviços por APIs.",
      focus: ["Construção de páginas e componentes web", "Adaptação de interfaces para diferentes telas", "Integração de interfaces com APIs"],
      skills: ["HTML", "CSS", "JavaScript", "APIs", "UI"]
    },
    {
      index: "EXPERIÊNCIA 03",
      period: "2020 — 2022",
      eyebrow: "PRIMEIROS PASSOS · BASE PROFISSIONAL",
      title: "Web Developer",
      company: "Freelancer",
      description: "O início da jornada com projetos para a web, explorando estrutura, estilo e interação. Uma fase de aprendizado prático, contato com diferentes necessidades e formação da base para os projetos seguintes.",
      focus: ["Criação de websites para diferentes segmentos", "Estruturação de páginas e conteúdo", "Desenvolvimento da base técnica em web"],
      skills: ["Websites", "HTML", "CSS", "JavaScript", "Freelancer"]
    }
  ];

  const fields = {
    index: document.getElementById("experienceModalIndex"),
    period: document.getElementById("experienceModalPeriod"),
    eyebrow: document.getElementById("experienceModalEyebrow"),
    title: document.getElementById("experienceModalTitle"),
    company: document.getElementById("experienceModalCompany"),
    description: document.getElementById("experienceModalDescription"),
    focus: document.getElementById("experienceModalFocus"),
    skills: document.getElementById("experienceModalSkills"),
    count: document.getElementById("experienceModalCount")
  };

  let previousFocus = null;

  function openExperience(index, trigger) {
    const item = experiences[index];
    if (!item) return;
    previousFocus = trigger;
    fields.index.textContent = item.index;
    fields.period.textContent = item.period;
    fields.eyebrow.textContent = item.eyebrow;
    fields.title.textContent = item.title;
    fields.company.textContent = item.company;
    fields.description.textContent = item.description;
    fields.count.textContent = String(index + 1).padStart(2, "0") + " / 03";
    fields.focus.replaceChildren(...item.focus.map((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      return li;
    }));
    fields.skills.replaceChildren(...item.skills.map((value) => {
      const span = document.createElement("span");
      span.textContent = value;
      return span;
    }));
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("experience-modal-active");
    modal.querySelector(".experience-modal-close").focus();
  }

  function closeExperience() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("experience-modal-active");
    if (previousFocus) previousFocus.focus();
  }

  document.querySelectorAll(".timeline-card").forEach((card, index) => {
    card.querySelectorAll(".timeline-arrow, .timeline-open").forEach((button) => {
      button.addEventListener("click", () => openExperience(index, button));
    });
  });

  modal.querySelectorAll("[data-close-experience]").forEach((element) => {
    element.addEventListener("click", closeExperience);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeExperience();
  });
});
