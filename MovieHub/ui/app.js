const token = localStorage.getItem("moviehub_token");

if (!token) {
  window.location.replace("/");
}

const state = {
  dashboard: null,
  movies: [],
  userId: null,
  moviePage: 1,
  totalPages: 1,
  pendingDelete: null,
  focusReturn: null
};

const numberFormatter = new Intl.NumberFormat();
const oneDecimal = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const elements = {
  navItems: document.querySelectorAll(".nav-item[data-view]"),
  views: document.querySelectorAll(".view"),
  pageTitle: document.querySelector("#page-title"),
  topbarContext: document.querySelector("#topbar-context"),
  userName: document.querySelector("#user-name"),
  userEmail: document.querySelector("#user-email"),
  userInitials: document.querySelector("#user-initials"),
  logout: document.querySelector("#logout-button"),
  dashboardLoading: document.querySelector("#dashboard-loading"),
  dashboardContent: document.querySelector("#dashboard-content"),
  dashboardError: document.querySelector("#dashboard-error"),
  retryDashboard: document.querySelector("#retry-dashboard"),
  metricTotalMovies: document.querySelector("#metric-total-movies"),
  metricAverageRating: document.querySelector("#metric-average-rating"),
  metricRatedMovies: document.querySelector("#metric-rated-movies"),
  metricAverageRuntime: document.querySelector("#metric-average-runtime"),
  metricTotalComments: document.querySelector("#metric-total-comments"),
  genreBars: document.querySelector("#genre-bars"),
  dashboardMovies: document.querySelector("#dashboard-movies"),
  movieFilterForm: document.querySelector("#movie-filter-form"),
  movieSearch: document.querySelector("#movie-search"),
  genreFilter: document.querySelector("#genre-filter"),
  ratingFilter: document.querySelector("#rating-filter"),
  sortFilter: document.querySelector("#sort-filter"),
  resetFilters: document.querySelector("#reset-filters"),
  movieSummary: document.querySelector("#movie-summary"),
  movieList: document.querySelector("#movie-list"),
  pagination: document.querySelector("#pagination"),
  addMovieButtons: [document.querySelector("#topbar-add-movie")],
  movieDialog: document.querySelector("#movie-dialog"),
  movieForm: document.querySelector("#movie-form"),
  movieId: document.querySelector("#movie-id"),
  movieDialogTitle: document.querySelector("#movie-dialog-title"),
  closeMovieDialog: document.querySelector("#close-movie-dialog"),
  cancelMovieDialog: document.querySelector("#cancel-movie-dialog"),
  saveMovie: document.querySelector("#save-movie"),
  movieFormMessage: document.querySelector("#movie-form-message"),
  movieTitle: document.querySelector("#movie-title"),
  movieYear: document.querySelector("#movie-year"),
  movieRuntime: document.querySelector("#movie-runtime"),
  movieGenres: document.querySelector("#movie-genres"),
  movieRating: document.querySelector("#movie-rating"),
  moviePlot: document.querySelector("#movie-plot"),
  deleteDialog: document.querySelector("#delete-dialog"),
  deleteDialogText: document.querySelector("#delete-dialog-text"),
  closeDeleteDialog: document.querySelector("#close-delete-dialog"),
  cancelDelete: document.querySelector("#cancel-delete"),
  confirmDelete: document.querySelector("#confirm-delete"),
  toast: document.querySelector("#toast")
};

function authHeaders(json = false) {
  const headers = { Authorization: `Bearer ${localStorage.getItem("moviehub_token")}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...authHeaders(Boolean(options.body)), ...(options.headers || {}) }
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    signOut();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function movieRating(movie) {
  const rating = movie?.imdb?.rating;
  return typeof rating === "number" ? oneDecimal.format(rating) : "—";
}

function posterMarkup(movie) {
  const url = typeof movie.poster === "string" && /^https?:\/\//i.test(movie.poster) ? movie.poster : "";
  if (url) return `<span class="movie-poster"><img src="${escapeHtml(url)}" alt="" loading="lazy" /></span>`;
  return `<span class="movie-poster" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5h16v13H4z" /><path d="m4 9 4-3.5M8 9l4-3.5M12 9l4-3.5M16 9l4-3.5M8 20v-4m4 4v-4m4 4v-4" /></svg></span>`;
}

function setFormMessage(element, text = "", type = "") {
  element.textContent = text;
  element.className = `form-message${type ? ` is-${type}` : ""}`;
}

let toastTimer;
function showToast(text) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = text;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
}

function signOut() {
  localStorage.removeItem("moviehub_token");
  localStorage.removeItem("moviehub_user");
  window.location.replace("/");
}

function showView(viewName) {
  elements.views.forEach((view) => view.classList.toggle("is-active", view.id === `${viewName}-view`));
  elements.navItems.forEach((item) => {
    const isActive = item.dataset.view === viewName;
    item.classList.toggle("is-active", isActive);
    if (item.tagName === "BUTTON") item.setAttribute("aria-current", isActive ? "page" : "false");
  });
  elements.pageTitle.textContent = viewName === "dashboard" ? "Dashboard" : "Movies";
  elements.topbarContext.textContent = viewName === "dashboard" ? "Catalog overview" : "Catalog operations";
  if (viewName === "movies") loadMovies({ page: state.moviePage });
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function renderDashboard(data) {
  state.dashboard = data;
  const { metrics, topGenres, topMovies } = data;
  elements.metricTotalMovies.textContent = numberFormatter.format(metrics.totalMovies);
  elements.metricAverageRating.textContent = oneDecimal.format(metrics.averageRating);
  elements.metricRatedMovies.textContent = numberFormatter.format(metrics.ratedMovies);
  elements.metricAverageRuntime.textContent = numberFormatter.format(metrics.averageRuntime);
  elements.metricTotalComments.textContent = numberFormatter.format(metrics.totalComments);

  const highestCount = Math.max(...topGenres.map((genre) => genre.movieCount), 1);
  elements.genreBars.innerHTML = topGenres.length
    ? topGenres.map((genre) => `<div class="genre-bar"><span class="genre-bar__label">${escapeHtml(genre.genre)}</span><span class="genre-bar__track"><span class="genre-bar__fill" style="width:${Math.round((genre.movieCount / highestCount) * 100)}%"></span></span><span class="genre-bar__value">${numberFormatter.format(genre.movieCount)}</span></div>`).join("")
    : '<p class="table-summary">No genre data is available.</p>';

  elements.dashboardMovies.innerHTML = topMovies.length
    ? topMovies.map((movie) => `<tr><td><strong>${escapeHtml(movie.title || "Untitled")}</strong></td><td class="genre-cell">${escapeHtml((movie.genres || []).join(", ") || "—")}</td><td class="number-cell">${escapeHtml(movie.year || "—")}</td><td class="number-cell">${movieRating(movie)}</td></tr>`).join("")
    : '<tr><td colspan="4">No rated movies were found.</td></tr>';

  const genres = [...new Set(topGenres.map((genre) => genre.genre).filter(Boolean))];
  const selectedGenre = elements.genreFilter.value;
  elements.genreFilter.innerHTML = `<option value="">All genres</option>${genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join("")}`;
  elements.genreFilter.value = genres.includes(selectedGenre) ? selectedGenre : "";
}

async function loadDashboard() {
  elements.dashboardLoading.classList.remove("is-hidden");
  elements.dashboardContent.classList.add("is-hidden");
  elements.dashboardError.classList.add("is-hidden");

  try {
    const data = await api("/api/dashboard");
    renderDashboard(data);
    elements.dashboardContent.classList.remove("is-hidden");
  } catch (error) {
    elements.dashboardError.classList.remove("is-hidden");
    elements.dashboardError.querySelector("p").textContent = error.message;
  } finally {
    elements.dashboardLoading.classList.add("is-hidden");
  }
}

function readFilters() {
  return {
    q: elements.movieSearch.value.trim(),
    genre: elements.genreFilter.value,
    minRating: elements.ratingFilter.value,
    sort: elements.sortFilter.value
  };
}

function hasActiveFilters(filters) {
  return Boolean(filters.q || filters.genre || filters.minRating || filters.sort !== "rating");
}

function renderMovieRows(items) {
  elements.movieList.setAttribute("aria-busy", "false");
  if (!items.length) {
    elements.movieList.innerHTML = '<div class="empty-state"><h2>No movies match those filters</h2><p>Try a shorter title search or reset the filters.</p><button class="button button--secondary" type="button" data-reset-empty>Reset filters</button></div>';
    return;
  }

  elements.movieList.innerHTML = items.map((movie) => {
    const canManage = movie.createdBy === state.userId;
    const actions = canManage
      ? `<button class="icon-button" type="button" data-edit-movie="${movie._id}" aria-label="Edit ${escapeHtml(movie.title || "movie")}" title="Edit movie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button><button class="icon-button" type="button" data-delete-movie="${movie._id}" aria-label="Delete ${escapeHtml(movie.title || "movie")}" title="Delete movie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v5m4-5v5M9 7l1-3h4l1 3m-9 0 1 13h10l1-13"/></svg></button>`
      : "";

    return `
      <article class="movie-row" data-movie-id="${movie._id}">
        ${posterMarkup(movie)}
        <div class="movie-title"><strong>${escapeHtml(movie.title || "Untitled")}</strong><p>${escapeHtml(movie.plot || (movie.genres || []).join(", ") || "No plot available.")}</p></div>
        <span class="movie-meta">${escapeHtml((movie.genres || []).slice(0, 2).join(" · ") || "—")}</span>
        <span class="movie-meta movie-meta--runtime">${escapeHtml(movie.year || "—")} · ${escapeHtml(movie.runtime || "—")} min</span>
        <span class="movie-rating">${movieRating(movie)}</span>
        <div class="movie-actions">${actions}</div>
      </article>
    `;
  }).join("");

  elements.movieList.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => image.closest(".movie-poster").innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5h16v13H4z" /><path d="m4 9 4-3.5M8 9l4-3.5M12 9l4-3.5M16 9l4-3.5M8 20v-4m4 4v-4m4 4v-4" /></svg>');
  });
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  elements.pagination.innerHTML = `
    <button class="button button--secondary" type="button" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>Previous</button>
    <span class="pagination__status">Page ${page} of ${totalPages}</span>
    <button class="button button--secondary" type="button" data-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>Next</button>
  `;
}

async function loadMovies({ page = 1 } = {}) {
  const filters = readFilters();
  const params = new URLSearchParams({ page: String(page), limit: "12", sort: filters.sort });
  if (filters.q) params.set("q", filters.q);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.minRating) params.set("minRating", filters.minRating);

  elements.movieList.setAttribute("aria-busy", "true");
  elements.movieList.innerHTML = '<span class="skeleton skeleton--wide"></span>';

  try {
    const data = await api(`/api/movies?${params.toString()}`);
    state.movies = data.items;
    state.moviePage = data.page;
    state.totalPages = data.totalPages;
    elements.movieSummary.textContent = `${numberFormatter.format(data.total)} matching movies · page ${data.page} of ${data.totalPages}`;
    elements.resetFilters.classList.toggle("is-hidden", !hasActiveFilters(filters));
    renderMovieRows(data.items);
    renderPagination(data.page, data.totalPages);
  } catch (error) {
    elements.movieList.setAttribute("aria-busy", "false");
    elements.movieList.innerHTML = `<div class="empty-state"><h2>Movies could not load</h2><p>${escapeHtml(error.message)}</p><button class="button button--secondary" type="button" data-retry-movies>Retry movies</button></div>`;
  }
}

function openMovieDialog(movie = null, trigger = document.activeElement) {
  state.focusReturn = trigger;
  elements.movieForm.reset();
  setFormMessage(elements.movieFormMessage);
  elements.movieId.value = movie?._id || "";
  elements.movieDialogTitle.textContent = movie ? "Edit movie" : "Add a movie";
  elements.saveMovie.textContent = movie ? "Save changes" : "Save movie";

  if (movie) {
    elements.movieTitle.value = movie.title || "";
    elements.movieYear.value = movie.year || "";
    elements.movieRuntime.value = movie.runtime || "";
    elements.movieGenres.value = (movie.genres || []).join(", ");
    elements.movieRating.value = movie.imdb?.rating ?? "";
    elements.moviePlot.value = movie.plot || "";
  }

  elements.movieDialog.showModal();
  window.setTimeout(() => elements.movieTitle.focus(), 0);
}

function closeDialog(dialog) {
  dialog.close();
}

async function editMovie(id, trigger) {
  try {
    const { movie } = await api(`/api/movies/${id}`);
    openMovieDialog(movie, trigger);
  } catch (error) {
    showToast(error.message);
  }
}

function openDeleteDialog(id, trigger) {
  const movie = state.movies.find((item) => item._id === id);
  state.pendingDelete = id;
  state.focusReturn = trigger;
  elements.deleteDialogText.textContent = `Delete “${movie?.title || "this movie"}”? This permanently removes it from the catalog.`;
  elements.deleteDialog.showModal();
  window.setTimeout(() => elements.confirmDelete.focus(), 0);
}

function moviePayload() {
  return {
    title: elements.movieTitle.value.trim(),
    year: elements.movieYear.value,
    runtime: elements.movieRuntime.value,
    genres: elements.movieGenres.value.split(",").map((genre) => genre.trim()).filter(Boolean),
    rating: elements.movieRating.value,
    plot: elements.moviePlot.value.trim()
  };
}

async function saveMovie(event) {
  event.preventDefault();
  const payload = moviePayload();
  setFormMessage(elements.movieFormMessage);

  if (!payload.title || !payload.year || !payload.runtime || !payload.genres.length) {
    setFormMessage(elements.movieFormMessage, "Title, year, runtime, and at least one genre are required.", "error");
    return;
  }

  const id = elements.movieId.value;
  const method = id ? "PUT" : "POST";
  const endpoint = id ? `/api/movies/${id}` : "/api/movies";
  elements.saveMovie.disabled = true;
  elements.saveMovie.textContent = id ? "Saving…" : "Adding…";

  try {
    await api(endpoint, { method, body: JSON.stringify(payload) });
    closeDialog(elements.movieDialog);
    showToast(id ? "Movie updated." : "Movie added to the catalog.");
    await Promise.all([loadMovies({ page: state.moviePage }), loadDashboard()]);
  } catch (error) {
    setFormMessage(elements.movieFormMessage, error.message, "error");
  } finally {
    elements.saveMovie.disabled = false;
    elements.saveMovie.textContent = id ? "Save changes" : "Save movie";
  }
}

async function deleteMovie() {
  if (!state.pendingDelete) return;
  const id = state.pendingDelete;
  elements.confirmDelete.disabled = true;
  elements.confirmDelete.textContent = "Deleting…";

  try {
    await api(`/api/movies/${id}`, { method: "DELETE" });
    closeDialog(elements.deleteDialog);
    showToast("Movie deleted from the catalog.");
    const targetPage = state.movies.length === 1 && state.moviePage > 1 ? state.moviePage - 1 : state.moviePage;
    await Promise.all([loadMovies({ page: targetPage }), loadDashboard()]);
  } catch (error) {
    showToast(error.message);
  } finally {
    elements.confirmDelete.disabled = false;
    elements.confirmDelete.textContent = "Delete movie";
    state.pendingDelete = null;
  }
}

function resetFilters() {
  elements.movieSearch.value = "";
  elements.genreFilter.value = "";
  elements.ratingFilter.value = "";
  elements.sortFilter.value = "rating";
  state.moviePage = 1;
  loadMovies({ page: 1 });
}

function restoreFocus() {
  state.focusReturn?.focus?.();
  state.focusReturn = null;
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    if (item.tagName === "BUTTON") item.addEventListener("click", () => showView(item.dataset.view));
  });
  document.querySelectorAll("[data-open-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.openView)));
  elements.logout.addEventListener("click", signOut);
  elements.retryDashboard.addEventListener("click", loadDashboard);
  elements.movieFilterForm.addEventListener("submit", (event) => { event.preventDefault(); loadMovies({ page: 1 }); });
  elements.movieSearch.addEventListener("input", debounce(() => loadMovies({ page: 1 }), 350));
  [elements.genreFilter, elements.ratingFilter, elements.sortFilter].forEach((input) => input.addEventListener("change", () => loadMovies({ page: 1 })));
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.addMovieButtons.filter(Boolean).forEach((button) => button.addEventListener("click", () => openMovieDialog(null, button)));
  elements.movieList.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-movie]");
    const remove = event.target.closest("[data-delete-movie]");
    const reset = event.target.closest("[data-reset-empty]");
    const retry = event.target.closest("[data-retry-movies]");
    if (edit) editMovie(edit.dataset.editMovie, edit);
    if (remove) openDeleteDialog(remove.dataset.deleteMovie, remove);
    if (reset) resetFilters();
    if (retry) loadMovies({ page: state.moviePage });
  });
  elements.pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (button && !button.disabled) loadMovies({ page: Number(button.dataset.page) });
  });
  elements.movieForm.addEventListener("submit", saveMovie);
  elements.closeMovieDialog.addEventListener("click", () => closeDialog(elements.movieDialog));
  elements.cancelMovieDialog.addEventListener("click", () => closeDialog(elements.movieDialog));
  elements.closeDeleteDialog.addEventListener("click", () => closeDialog(elements.deleteDialog));
  elements.cancelDelete.addEventListener("click", () => closeDialog(elements.deleteDialog));
  elements.confirmDelete.addEventListener("click", deleteMovie);
  [elements.movieDialog, elements.deleteDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", restoreFocus);
  });
}

function debounce(callback, wait) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
}

async function initialise() {
  try {
    const { user } = await api("/api/auth/me");
    state.userId = user.id;
    elements.userName.textContent = user.name;
    elements.userEmail.textContent = user.email;
    elements.userInitials.textContent = user.name.slice(0, 2).toUpperCase();
    bindEvents();
    await loadDashboard();
  } catch (error) {
    if (localStorage.getItem("moviehub_token")) showToast(error.message);
  }
}

initialise();
