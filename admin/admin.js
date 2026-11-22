(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const configured =
    cfg.url &&
    cfg.anonKey &&
    !cfg.url.includes("SEU-PROJETO") &&
    !cfg.anonKey.includes("SUA_CHAVE");
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Selects customizados: mantêm o select nativo como fonte do valor/formulário.
  function initCustomSelects() {
    $$("select").forEach((select, index) => {
      if (select.dataset.customized) return;
      select.dataset.customized = "true";
      const wrapper = document.createElement("div");
      wrapper.className = "custom-select";
      wrapper.dataset.selectId = select.id || `select-${index}`;
      select.parentNode.insertBefore(wrapper, select);
      wrapper.append(select);
      select.classList.add("native-select");

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", select.getAttribute("aria-label") || select.labels?.[0]?.textContent.trim() || "Selecionar opção");

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-chevron-down";
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "custom-select-value";
      trigger.append(label, icon);

      const list = document.createElement("div");
      list.className = "custom-select-options";
      list.setAttribute("role", "listbox");
      list.hidden = true;

      [...select.options].forEach((option, optionIndex) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "custom-select-option";
        item.textContent = option.textContent;
        item.dataset.value = option.value;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.selected));
        item.disabled = option.disabled;
        item.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          closeCustomSelect(wrapper);
          trigger.focus();
        });
        list.append(item);
      });

      wrapper.append(trigger, list);
      const sync = () => {
        const selected = select.options[select.selectedIndex];
        label.textContent = selected?.textContent || "Selecione";
        [...list.children].forEach((item) => {
          const active = item.dataset.value === select.value;
          item.classList.toggle("selected", active);
          item.setAttribute("aria-selected", String(active));
        });
      };
      select.addEventListener("change", sync);
      trigger.addEventListener("click", () => {
        const isOpen = wrapper.classList.contains("open");
        $$(".custom-select.open").forEach(closeCustomSelect);
        if (!isOpen) {
          wrapper.classList.add("open");
          list.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
        }
      });
      sync();
    });
  }
  function closeCustomSelect(wrapper) {
    wrapper.classList.remove("open");
    const trigger = $(".custom-select-trigger", wrapper);
    const list = $(".custom-select-options", wrapper);
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (list) list.hidden = true;
  }
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".custom-select")) {
      $$(".custom-select.open").forEach(closeCustomSelect);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") $$(".custom-select.open").forEach(closeCustomSelect);
  });
  initCustomSelects();

  // A senha só fica visível durante o pressionamento (mouse, caneta ou toque).
  const passwordInput = $("#loginPassword");
  const passwordToggle = $(".password-toggle");
  if (passwordInput && passwordToggle) {
    const revealPassword = (event) => {
      if (event.cancelable) event.preventDefault();
      passwordInput.type = "text";
      passwordToggle.setAttribute("aria-pressed", "true");
      passwordToggle.innerHTML = '<i class="fa-regular fa-eye-slash" aria-hidden="true"></i>';
    };
    const hidePassword = () => {
      passwordInput.type = "password";
      passwordToggle.setAttribute("aria-pressed", "false");
      passwordToggle.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
    };
    passwordToggle.addEventListener("pointerdown", revealPassword);
    ["pointerup", "pointerleave", "pointercancel", "lostpointercapture", "blur"].forEach((type) =>
      passwordToggle.addEventListener(type, hidePassword)
    );
    passwordToggle.addEventListener("contextmenu", (event) => event.preventDefault());
  }
  const loginView = $("#loginView"),
    appView = $("#appView"),
    loginForm = $("#loginForm"),
    loginError = $("#loginError");
  let supabase = null,
    projects = [],
    messages = [];
  const escapeHTML = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const toast = (msg) => {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 3000);
  };
  const date = (value) =>
    value ? new Date(value).toLocaleDateString("pt-BR") : "—";
  function showApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    loadAll();
  }
  function showLogin() {
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
  }
  function initClient() {
    if (!configured) {
      loginError.textContent =
        "Configure a URL e a chave anon do Supabase em admin/config.js.";
      return false;
    }
    if (!window.supabase) {
      loginError.textContent = "Não foi possível carregar o cliente Supabase.";
      return false;
    }
    supabase = window.supabase.createClient(cfg.url, cfg.anonKey);
    return true;
  }
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    if (!supabase && !initClient()) return;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: $("#loginEmail").value.trim(),
      password: $("#loginPassword").value,
    });
    if (error) {
      loginError.textContent = error.message;
      return;
    }
    showApp();
  });
  $("#logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    showLogin();
  });
  if (configured && window.supabase) {
    supabase = window.supabase.createClient(cfg.url, cfg.anonKey);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) showApp();
    });
  }
  async function loadAll() {
    await Promise.all([loadProjects(), loadMessages()]);
    renderStats();
  }
  async function loadProjects() {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      $("#projectGrid").innerHTML =
        `<p class="empty">Não foi possível carregar projetos: ${escapeHTML(error.message)}</p>`;
      $("#recentProjects").innerHTML = "";
      return;
    }
    projects = data || [];
    renderProjects();
  }
  async function loadMessages() {
    const { data, error } = await supabase
      .from("portfolio_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      messages = [];
      $("#messageRows").innerHTML =
        `<tr><td colspan="5" class="empty">Tabela de mensagens indisponível. ${escapeHTML(error.message)}</td></tr>`;
      return;
    }
    messages = data || [];
    renderMessages();
  }
  function renderStats() {
    $("#statProjects").textContent = projects.length;
    $("#statPublished").textContent = projects.filter(
      (p) => p.status === "published",
    ).length;
    $("#statMessages").textContent = messages.length;
    $("#navProjectCount").textContent = projects.length;
    $("#navMessageCount").textContent = messages.length;
    $("#recentProjects").innerHTML =
      projects
        .slice(0, 5)
        .map(
          (p) =>
            `<div class="recent-item"><img class="thumb" src="${escapeHTML(p.image_url || "../imagens/profile.webp")}" alt=""><div><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.category || "Projeto")} · ${p.status === "published" ? "Publicado" : "Rascunho"}</small></div><span class="push badge ${p.status}">${p.status === "published" ? "Publicado" : "Rascunho"}</span></div>`,
        )
        .join("") ||
      '<div class="empty">Nenhum projeto cadastrado ainda.</div>';
  }
  function renderProjects() {
    const q = $("#projectSearch").value.toLowerCase(),
      f = $("#projectFilter").value;
    const list = projects.filter(
      (p) =>
        (f === "all" || p.status === f) &&
        `${p.name} ${p.description || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(q),
    );
    $("#projectGrid").innerHTML =
      list
        .map(
          (p) =>
            `<article class="project-card"><img src="${escapeHTML(p.image_url || "../imagens/profile.webp")}" alt=""><div class="project-content"><div class="project-meta"><span class="badge">${escapeHTML(p.category || "Projeto")}</span><span class="badge ${p.status}">${p.status === "published" ? "Publicado" : "Rascunho"}</span></div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || "Sem descrição.")}</p><div class="card-actions"><button data-edit="${p.id}"><i class="fa-solid fa-pen"></i> Editar</button><button data-delete="${p.id}"><i class="fa-regular fa-trash-can"></i> Excluir</button></div></div></article>`,
        )
        .join("") || '<div class="empty">Nenhum projeto encontrado.</div>';
    renderStats();
  }
  function renderMessages() {
    const q = $("#messageSearch").value.toLowerCase();
    const list = messages.filter((m) =>
      `${m.name || ""} ${m.email || ""} ${m.subject || ""}`
        .toLowerCase()
        .includes(q),
    );
    $("#messageRows").innerHTML =
      list
        .map(
          (m) =>
            `<tr><td><b>${escapeHTML(m.name || "Sem nome")}</b><br><span class="muted">${escapeHTML(m.email || "")}</span></td><td>${escapeHTML(m.subject || "—")}</td><td>${date(m.created_at)}</td><td><span class="badge">${escapeHTML(m.status || "Recebida")}</span></td><td><div class="table-actions"><button data-message="${m.id}" title="Ler"><i class="fa-regular fa-eye"></i></button><button data-message-delete="${m.id}" title="Excluir"><i class="fa-regular fa-trash-can"></i></button></div></td></tr>`,
        )
        .join("") ||
      '<tr><td colspan="5" class="empty">Nenhuma mensagem encontrada.</td></tr>';
  }
  function navigate(view) {
    $$(".view").forEach((el) => el.classList.add("hidden"));
    $("#view-" + view).classList.remove("hidden");
    $$(".nav-item").forEach((el) =>
      el.classList.toggle("active", el.dataset.view === view),
    );
    $("#pageTitle").textContent =
      { overview: "Visão geral", projects: "Projetos", messages: "Mensagens" }[
        view
      ] || view;
    $("#sidebar").classList.remove("open");
  }
  document.addEventListener("click", async (e) => {
    const nav = e.target.closest("[data-view]");
    if (nav) {
      navigate(nav.dataset.view);
      return;
    }
    if (e.target.closest("[data-action='new-project']")) {
      openProject();
      return;
    }
    if (e.target.closest("[data-close]")) {
      e.target.closest("dialog").close();
      return;
    }
    const edit = e.target.closest("[data-edit]");
    if (edit) {
      openProject(projects.find((p) => String(p.id) === edit.dataset.edit));
      return;
    }
    const del = e.target.closest("[data-delete]");
    if (del && confirm("Excluir este projeto?")) {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", del.dataset.delete);
      if (error) toast(error.message);
      else {
        toast("Projeto excluído.");
        loadAll();
      }
      return;
    }
    const msg = e.target.closest("[data-message]");
    if (msg) {
      const m = messages.find((x) => String(x.id) === msg.dataset.message);
      $("#messageTitle").textContent = m.subject || "Mensagem";
      $("#messageBody").innerHTML =
        `<p><b>De:</b> ${escapeHTML(m.name)} · ${escapeHTML(m.email)}</p><p><b>Data:</b> ${date(m.created_at)}</p><p>${escapeHTML(m.message || "")}</p>`;
      $("#messageDialog").showModal();
      return;
    }
    const md = e.target.closest("[data-message-delete]");
    if (md && confirm("Excluir esta mensagem?")) {
      const { error } = await supabase
        .from("portfolio_messages")
        .delete()
        .eq("id", md.dataset.message);
      if (error) toast(error.message);
      else {
        toast("Mensagem excluída.");
        loadAll();
      }
    }
  });
  function openProject(p) {
    $("#projectForm").reset();
    $("#projectId").value = p?.id || "";
    $("#projectDialogTitle").textContent = p
      ? "Editar projeto"
      : "Novo projeto";
    $("#projectName").value = p?.name || "";
    $("#projectCategory").value = p?.category || "web";
    $("#projectStatus").value = p?.status || "draft";
    $("#projectCategory").dispatchEvent(new Event("change", { bubbles: true }));
    $("#projectStatus").dispatchEvent(new Event("change", { bubbles: true }));
    $("#projectDescription").value = p?.description || "";
    $("#projectImage").value = p?.image_url || "";
    $("#projectLive").value = p?.live_url || "";
    $("#projectGithub").value = p?.github_url || "";
    $("#projectTech").value = Array.isArray(p?.technologies)
      ? p.technologies.join(", ")
      : p?.technologies || "";
    $("#projectFeatured").checked = !!p?.featured;
    $("#projectFeedback").textContent = "";
    $("#projectDialog").showModal();
  }
  $("#projectForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#projectId").value;
    const payload = {
      name: $("#projectName").value.trim(),
      category: $("#projectCategory").value,
      status: $("#projectStatus").value,
      description: $("#projectDescription").value.trim(),
      image_url: $("#projectImage").value.trim() || null,
      live_url: $("#projectLive").value.trim() || null,
      github_url: $("#projectGithub").value.trim() || null,
      technologies: $("#projectTech")
        .value.split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      featured: $("#projectFeatured").checked,
      updated_at: new Date().toISOString(),
    };
    const result = id
      ? await supabase.from("portfolio_projects").update(payload).eq("id", id)
      : await supabase.from("portfolio_projects").insert(payload);
    if (result.error) {
      $("#projectFeedback").textContent = result.error.message;
      return;
    }
    $("#projectDialog").close();
    toast("Projeto salvo.");
    await loadAll();
  });
  $("#projectSearch").addEventListener("input", renderProjects);
  $("#projectFilter").addEventListener("change", renderProjects);
  $("#messageSearch").addEventListener("input", renderMessages);
  $("#mobileMenu").addEventListener("click", () =>
    $("#sidebar").classList.toggle("open"),
  );
})();
