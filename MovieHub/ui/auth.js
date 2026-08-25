const authForm = document.querySelector("#auth-form");
const authTabs = document.querySelectorAll("[data-auth-mode]");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const submitButton = document.querySelector("#auth-submit");
const message = document.querySelector("#auth-message");
const authTitle = document.querySelector("#auth-title");
const authKicker = document.querySelector("#auth-kicker");
const authDescription = document.querySelector("#auth-description");
const authFootnote = document.querySelector("#auth-footnote");
const passwordHint = document.querySelector("#password-hint");

let mode = "login";

if (localStorage.getItem("moviehub_token")) {
  window.location.replace("/app");
}

function setMessage(text = "", type = "") {
  message.textContent = text;
  message.className = `form-message${type ? ` is-${type}` : ""}`;
}

function setFieldError(input, text = "") {
  const group = input.closest(".field-group");
  const error = group.querySelector(".field-error");
  error.textContent = text;
  group.classList.toggle("has-error", Boolean(text));
  input.setAttribute("aria-invalid", String(Boolean(text)));
  input.setAttribute("aria-describedby", error.id);
}

function validate() {
  let isValid = true;
  setFieldError(nameInput);
  setFieldError(emailInput);
  setFieldError(passwordInput);

  if (mode === "register" && nameInput.value.trim().length < 2) {
    setFieldError(nameInput, "Enter at least 2 characters.");
    isValid = false;
  }

  if (!/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
    setFieldError(emailInput, "Enter a valid email address.");
    isValid = false;
  }

  if (passwordInput.value.length < 8) {
    setFieldError(passwordInput, "Use at least 8 characters.");
    isValid = false;
  }

  return isValid;
}

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === "register";

  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authMode === mode;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  nameField.classList.toggle("is-hidden", !isRegister);
  nameInput.required = isRegister;
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
  authKicker.textContent = isRegister ? "Create your account" : "Welcome back";
  authTitle.textContent = isRegister ? "Join MovieHub" : "Sign in to continue";
  authDescription.textContent = isRegister
    ? "Create an account to monitor and maintain the movie catalog."
    : "Use your MovieHub account to manage the catalog.";
  passwordHint.textContent = "At least 8 characters";
  submitButton.textContent = isRegister ? "Create account" : "Sign in";
  if (authFootnote) {
    authFootnote.innerHTML = isRegister
      ? 'Already have an account? <button class="text-button" type="button" data-auth-mode="login">Sign in</button>'
      : 'New to MovieHub? <button class="text-button" type="button" data-auth-mode="register">Create an account</button>';
  }
  setMessage();
  [nameInput, emailInput, passwordInput].forEach((input) => setFieldError(input));
}

async function submitAuth(event) {
  event.preventDefault();
  setMessage();
  if (!validate()) {
    authForm.querySelector("[aria-invalid='true']")?.focus();
    return;
  }

  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value
  };
  if (mode === "register") payload.name = nameInput.value.trim();

  submitButton.disabled = true;
  submitButton.textContent = mode === "register" ? "Creating account…" : "Signing in…";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Could not continue.");

    localStorage.setItem("moviehub_token", data.token);
    localStorage.setItem("moviehub_user", JSON.stringify(data.user));
    window.location.assign("/app");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === "register" ? "Create account" : "Sign in";
  }
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.authMode));
});

authFootnote?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-auth-mode]");
  if (trigger) setMode(trigger.dataset.authMode);
});

passwordToggle.addEventListener("click", () => {
  const showPassword = passwordInput.type === "password";
  passwordInput.type = showPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
  passwordToggle.title = showPassword ? "Hide password" : "Show password";
});

authForm.addEventListener("submit", submitAuth);
