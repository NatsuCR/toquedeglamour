const list = (value) => Array.isArray(value) ? value : (value ? [value] : []);
const clean = (value, fallback) => String(value || '').trim() || fallback;

function imageList(settings, fallback) {
  let images = [];
  try {
    images = JSON.parse(settings.heroImagesJson || '[]');
  } catch {
    images = [];
  }
  if (!Array.isArray(images)) images = list(images);
  const legacy = String(settings.heroImageUrl || '').trim();
  if (legacy && !images.includes(legacy)) images.unshift(legacy);
  images = [...new Set(images.map(String).filter(Boolean))];
  return images.length ? images : [fallback];
}

function savedSlides(settings) {
  try {
    const parsed = JSON.parse(settings.heroSlidesJson || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getHeroSlides(settings, defaults) {
  const images = imageList(settings, defaults.heroImageUrl);
  const saved = savedSlides(settings);
  return images.map((image) => {
    const slide = saved.find((item) => item.image === image) || {};
    return {
      image,
      eyebrow: clean(slide.eyebrow, settings.heroEyebrow || defaults.heroEyebrow),
      title: clean(slide.title, settings.heroTitle || defaults.heroTitle),
      text: clean(slide.text, settings.heroText || defaults.heroText)
    };
  });
}

export function prepareHeroSlides(settings, data, files, defaults) {
  const current = getHeroSlides(settings, defaults);
  const eyebrows = list(data.heroSlideEyebrow);
  const titles = list(data.heroSlideTitle);
  const texts = list(data.heroSlideText);
  const removed = new Set(list(data.removeHeroImages).map(String));
  const replacementIndexes = list(data.heroReplacementIndexes);
  const replacements = files.heroReplacements || [];
  const replacementMap = new Map(replacementIndexes.map((value, index) => [
    Number.parseInt(value, 10), replacements[index]
  ]));
  let slides = current.map((slide, index) => ({
    image: replacementMap.has(index)
      ? `/uploads/branding/${replacementMap.get(index).filename}`
      : slide.image,
    eyebrow: clean(eyebrows[index], slide.eyebrow),
    title: clean(titles[index], slide.title),
    text: clean(texts[index], slide.text)
  })).filter((slide) => !removed.has(slide.image));

  const newEyebrows = list(data.newHeroEyebrow);
  const newTitles = list(data.newHeroTitle);
  const newTexts = list(data.newHeroText);
  const uploaded = [...(files.heroImage || []), ...(files.heroImages || [])];
  uploaded.forEach((file, index) => {
    slides.push({
      image: `/uploads/branding/${file.filename}`,
      eyebrow: clean(newEyebrows[index], defaults.heroEyebrow),
      title: clean(newTitles[index], defaults.heroTitle),
      text: clean(newTexts[index], defaults.heroText)
    });
  });
  return slides.length ? slides : [{
    image: defaults.heroImageUrl,
    eyebrow: defaults.heroEyebrow,
    title: defaults.heroTitle,
    text: defaults.heroText
  }];
}
