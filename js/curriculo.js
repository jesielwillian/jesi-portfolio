async function baixarCurriculo(event) {
  event.preventDefault();

  const url = event.currentTarget.getAttribute("href");

  try {
    const resp = await fetch(url);

    if (!resp.ok) throw new Error("Falha ao baixar");

    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "jesi-curriculo.pdf";

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (e) {
    console.error("Erro ao baixar:", e);
    window.open(url, "_blank");
  }
}
