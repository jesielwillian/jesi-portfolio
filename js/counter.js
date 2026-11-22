/**
 * CONTADOR DE EXPERIÊNCIA
 * Anima o indicador de tempo de experiência na seção Sobre.
 */

document.addEventListener("DOMContentLoaded", () => {
  const counter = document.getElementById("experience-counter");
  if (!counter) return;
  const duration = 1500; // Duração total da animação, em milissegundos.
  const target = 5; // Valor final apresentado no indicador.
  const startTime = performance.now();

  /**
   * Atualiza o número a cada quadro até alcançar o valor final.
   * @param {number} currentTime Timestamp fornecido pelo requestAnimationFrame.
   */
  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    counter.textContent = Math.floor(progress * target);
    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }
    counter.textContent = target;
  }
  requestAnimationFrame(update);
});
