/**
 * CONTEÚDO DO MODAL DE PROJETOS
 * Preenche a descrição do modal com o data-description do projeto selecionado.
 * A abertura e o fechamento do modal são controlados por js/script.js.
 */

document.addEventListener("DOMContentLoaded", () => {
  const modalDescription = document.getElementById("modalDescription");
  if (!modalDescription) return;
  document.querySelectorAll(".view-project").forEach((button) => {
    button.addEventListener("click", () => {
      modalDescription.textContent = button.dataset.description ?? "";
    });
  });
});
