function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
}

function optionalText(value) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function optionalNumber(value, label, min, max) {
  if (value === "" || value === undefined || value === null) return undefined;
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}.`);
  }

  return number;
}

function parseGenres(value) {
  const values = Array.isArray(value) ? value : String(value ?? "").split(",");
  return [...new Set(values.map((genre) => String(genre).trim()).filter(Boolean))].slice(0, 12);
}

export function parseMovieInput(payload, { partial = false } = {}) {
  if (!isPlainObject(payload)) throw new Error("Movie data must be a JSON object.");

  const movie = {};
  if (!partial || payload.title !== undefined) movie.title = requiredText(payload.title, "Title");
  if (!partial || payload.year !== undefined) movie.year = optionalNumber(payload.year, "Year", 1888, 2100);
  if (!partial || payload.runtime !== undefined) movie.runtime = optionalNumber(payload.runtime, "Runtime", 1, 1000);
  if (!partial || payload.genres !== undefined) movie.genres = parseGenres(payload.genres);
  if (!partial || payload.plot !== undefined) movie.plot = optionalText(payload.plot) || "";
  if (!partial || payload.rating !== undefined) movie.rating = optionalNumber(payload.rating, "IMDb rating", 0, 10);

  if (!partial && movie.year === undefined) throw new Error("Year is required.");
  if (!partial && movie.runtime === undefined) throw new Error("Runtime is required.");
  if (!partial && movie.genres.length === 0) throw new Error("Add at least one genre.");

  return movie;
}

export function createMovieDocument(movie, userId) {
  const document = {
    title: movie.title,
    year: movie.year,
    runtime: movie.runtime,
    genres: movie.genres,
    plot: movie.plot,
    type: "movie",
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (movie.rating !== undefined) {
    document.imdb = { rating: movie.rating, votes: 0 };
  }

  return document;
}

export function createMovieUpdate(movie) {
  const update = { updatedAt: new Date() };

  for (const field of ["title", "year", "runtime", "genres", "plot"]) {
    if (movie[field] !== undefined) update[field] = movie[field];
  }

  if (movie.rating !== undefined) update["imdb.rating"] = movie.rating;
  return update;
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
