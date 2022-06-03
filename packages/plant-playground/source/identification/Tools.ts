export const makeIdentificationRequest = async (dataUrl: string, language = "en") => {
  const blob = await fetch(dataUrl).then(file => file.blob());

  const form = new FormData();
  form.append("organs", "auto");
  form.append("images", new File([blob], "plant.png", { type: "image/png" }));

  const url = new URL("https://my-api.plantnet.org/v2/identify/all");
  url.searchParams.append("include-related-images", "true");
  url.searchParams.append("lang", language);

  url.searchParams.append("api-key", "2b10VcWxLk6cFsKCFXrPoMJw3u");

  return fetch(url.toString(), {
    method: "POST",
    body: form,
  });
};
