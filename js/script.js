"use strict";

$("html").addClass("js");

/* ---------- Shared helpers ---------- */
// localStorage can throw (private mode, blocked data), so every access is wrapped.
const store = {
  get: function (key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  },
  set: function (key, value) {
    try { localStorage.setItem(key, value); return true; } catch (error) { return false; }
  },
  remove: function (key) {
    try { localStorage.removeItem(key); } catch (error) { /* ignore */ }
  }
};
const KEYS = { theme: "sca-theme", user: "sca-user", titans: "sca-titans" };
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Light / dark theme (saved in localStorage) ---------- */
function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("meta[name='theme-color']").attr("content", theme === "light" ? "#fffaf0" : "#1e392a");
  const next = theme === "light" ? "dark" : "light";
  $(".theme-toggle")
    .attr("aria-label", "Switch to " + next + " theme")
    .find(".theme-icon").text(next === "light" ? "☀" : "☾").end()
    .find(".theme-label").text(next === "light" ? "Light" : "Dark");
}
applyTheme(currentTheme());
$(".theme-toggle").on("click", function () {
  const theme = currentTheme() === "light" ? "dark" : "light";
  store.set(KEYS.theme, theme);
  applyTheme(theme);
});

/* ---------- Sign-in state (saved in localStorage) ---------- */
function getUser() {
  const raw = store.get(KEYS.user);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (user && typeof user.name === "string" && user.name && typeof user.email === "string") return user;
  } catch (error) { /* damaged value: treat as signed out */ }
  return null;
}
function favoritesKey(user) { return "sca-favorites:" + user.email; }
function getFavorites() {
  const user = getUser();
  if (!user) return [];
  try {
    const list = JSON.parse(store.get(favoritesKey(user)) || "[]");
    return Array.isArray(list) ? list : [];
  } catch (error) { return []; }
}
function setFavorites(list) {
  const user = getUser();
  if (user) store.set(favoritesKey(user), JSON.stringify(list));
}
function renderAuth() {
  const user = getUser();
  document.documentElement.setAttribute("data-auth", user ? "in" : "out");
  $("[data-user-name]").text(user ? user.name : "");
  $("[data-user-email]").text(user ? user.email : "");
  $("[data-user-since]").text(user && user.signedInAt ? new Date(user.signedInAt).toLocaleString() : "");
  $("[data-user-favorites]").text(getFavorites().length);
  $(document).trigger("sca:auth");
}
function signOut() {
  store.remove(KEYS.user);
  renderAuth();
  $("#signout-status").prop("hidden", false);
}
renderAuth();
$(document).on("click", "[data-signout]", signOut);

// Keep several open tabs in sync
window.addEventListener("storage", function (event) {
  if (event.key === KEYS.theme) applyTheme(event.newValue === "light" ? "light" : "dark");
  if (event.key === KEYS.user) renderAuth();
});

// Shared with js/characters.js
window.SCA = { store: store, getUser: getUser, getFavorites: getFavorites, setFavorites: setFavorites };

/* ---------- Sign-in form ---------- */
const signinForm = document.querySelector("#signin-form");
if (signinForm) {
  const rules = {
    name: function (value) {
      if (!value) return "Please enter a display name.";
      if (value.length < 2) return "Enter at least 2 characters.";
      return "";
    },
    email: function (value) {
      if (!value) return "Please enter your email.";
      if (!EMAIL_PATTERN.test(value)) return "Enter a valid email, like scout@example.com.";
      return "";
    },
    password: function (value) {
      if (!value) return "Please enter a password.";
      if (value.length < 8) return "Use at least 8 characters.";
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return "Include at least one letter and one number.";
      return "";
    }
  };
  function checkSigninField(input) {
    const value = input.name === "password" ? input.value : input.value.trim();
    const error = rules[input.name](value);
    input.setCustomValidity(error);
    const valid = !error;
    $(input).toggleClass("is-invalid", !valid).toggleClass("is-valid", valid).attr("aria-invalid", !valid);
    $("#" + input.id + "-feedback").text(valid ? "Looks good." : error)
      .toggleClass("error", !valid).toggleClass("success", valid);
    return valid;
  }
  const signinFields = $(signinForm).find(".form-control").toArray();
  $(signinFields).on("input blur", function () { checkSigninField(this); });
  $("#show-password").on("change", function () {
    $("#signin-password").attr("type", this.checked ? "text" : "password");
  });
  $(signinForm).on("submit", function (event) {
    event.preventDefault();
    const results = signinFields.map(checkSigninField);
    if (results.indexOf(false) !== -1) {
      $("#signin-error").prop("hidden", false);
      $(signinFields.filter(function (input) { return !input.checkValidity(); })[0]).trigger("focus");
      return;
    }
    $("#signin-error").prop("hidden", true);
    // Only non-sensitive data is stored. The password is never saved.
    const user = {
      name: signinForm.elements.namedItem("name").value.trim(),
      email: signinForm.elements.namedItem("email").value.trim().toLowerCase(),
      signedInAt: new Date().toISOString()
    };
    if (!store.set(KEYS.user, JSON.stringify(user))) {
      $("#signin-error").text("Your browser blocked saving the sign-in. Enable site data and try again.").prop("hidden", false);
      return;
    }
    signinForm.reset();
    signinFields.forEach(function (input) {
      input.setCustomValidity("");
      $(input).removeClass("is-valid is-invalid").removeAttr("aria-invalid");
    });
    $(".field-feedback", signinForm).text("").removeClass("error success");
    $("#signout-status").prop("hidden", true);
    renderAuth();
    $("#auth-status").text("Welcome, " + user.name + "! You are now signed in.").trigger("focus");
  });
}

/* ---------- Mobile menu ---------- */
$(".menu-toggle").on("click", function () {
  const open = $(this).attr("aria-expanded") !== "true";
  $(this).attr("aria-expanded", open).text(open ? "Close −" : "Menu +");
  $(".site-nav").toggleClass("is-open", open);
});
$(".site-nav").on("keydown", function (event) {
  if (event.key === "Escape") {
    $(".menu-toggle").attr("aria-expanded", false).text("Menu +").trigger("focus");
    $(this).removeClass("is-open");
  }
});

/* ---------- FAQ accordion (jQuery slideToggle) ---------- */
$(".faq-question").on("click", function () {
  const button = $(this);
  const answer = $("#" + button.attr("aria-controls"));
  const opening = button.attr("aria-expanded") !== "true";
  button.attr("aria-expanded", opening).toggleClass("is-open", opening);
  button.find(".faq-icon").text(opening ? "−" : "+");
  answer.stop(true, true).slideToggle(reducedMotion ? 0 : 300);
});

/* ---------- Image viewer ---------- */
const viewer = document.querySelector("#archive-viewer");
if (viewer) {
  const pictures = $("[data-viewer]").toArray();
  const speed = reducedMotion ? 0 : 150;
  let pictureIndex = 0;

  function showPicture() {
    const picture = pictures[pictureIndex].dataset;
    $(".dialog-image").attr({ src: picture.image, alt: picture.title });
    $("#viewer-title").text(picture.title);
    $("#viewer-description").text(picture.description);
    $("#viewer-count").text((pictureIndex + 1) + " / " + pictures.length);
  }
  function closeViewer() {
    $(viewer).stop(true, true).fadeOut(speed, function () {
      viewer.close();
      $(viewer).css("display", "");
    });
  }
  function movePicture(step) {
    pictureIndex = (pictureIndex + step + pictures.length) % pictures.length;
    $(".dialog-image").stop(true, true).fadeOut(speed, function () {
      showPicture();
      $(this).fadeIn(speed);
    });
  }
  $(pictures).on("click", function () {
    pictureIndex = pictures.indexOf(this);
    showPicture();
    viewer.showModal();
    $(viewer).hide().fadeIn(speed);
  });
  $(".dialog-close").on("click", closeViewer);
  $("#previous-image").on("click", function () { movePicture(-1); });
  $("#next-image").on("click", function () { movePicture(1); });
  $(viewer).on("cancel", function (event) {
    event.preventDefault();
    closeViewer();
  });
  $(viewer).on("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      movePicture(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  $(viewer).on("click", function (event) {
    const box = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom)) closeViewer();
  });
}

/* ---------- Titan records (saved in localStorage) ---------- */
const titanForm = document.querySelector("#titan-form");
if (titanForm) {
  const defaultTitans = [
    { power: "Founding Titan", inheritor: "Eren Yeager", height: "Varies¹", ability: "Commands Titans; influences memories", status: "Restricted access" },
    { power: "Attack Titan", inheritor: "Eren Yeager", height: "15 m", ability: "Close combat; exceptional endurance", status: "Active" },
    { power: "Colossal Titan", inheritor: "Armin Arlert", height: "60 m", ability: "Enormous scale; heat and steam", status: "Active" },
    { power: "Armored Titan", inheritor: "Reiner Braun", height: "15 m", ability: "Hardened armour plates", status: "Active" },
    { power: "Female Titan", inheritor: "Annie Leonhart", height: "14 m", ability: "Agility; hardening", status: "Crystallised" },
    { power: "Beast Titan", inheritor: "Zeke Yeager", height: "17 m", ability: "Long-range throwing", status: "Active" },
    { power: "Jaw Titan", inheritor: "Porco Galliard", height: "5 m", ability: "Speed; powerful jaws and claws", status: "Active" },
    { power: "Cart Titan", inheritor: "Pieck Finger", height: "4 m", ability: "Endurance; mobile support", status: "Active" },
    { power: "War Hammer Titan", inheritor: "Lara Tybur", height: "About 15 m", ability: "Creates hardened weapons", status: "Concealed" }
  ];
  const fields = ["power", "inheritor", "height", "ability", "status"];
  const copyTitans = function (list) {
    return list.map(function (item) { return Object.assign({}, item); });
  };
  function loadTitans() {
    const raw = store.get(KEYS.titans);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        const valid = Array.isArray(saved) && saved.every(function (item) {
          return item && fields.every(function (field) { return typeof item[field] === "string" && item[field]; });
        });
        if (valid) return saved;
      } catch (error) { /* fall back to the original records */ }
    }
    return copyTitans(defaultTitans);
  }
  function saveTitans() {
    if (!store.set(KEYS.titans, JSON.stringify(titans))) {
      $("#table-status").text("Changes could not be saved in this browser.");
    }
  }
  let titans = loadTitans();
  let category = "all";
  let editIndex = -1;

  // Confirmation dialog (replaces the browser's confirm box)
  const confirmDialog = document.querySelector("#confirm-dialog");
  function askConfirm(title, text, okLabel) {
    if (!confirmDialog || typeof confirmDialog.showModal !== "function") {
      return Promise.resolve(window.confirm(text));
    }
    return new Promise(function (resolve) {
      $("#confirm-title").text(title);
      $("#confirm-text").text(text);
      $("#confirm-ok").text(okLabel);
      const finish = function (answer) {
        $("#confirm-ok, #confirm-cancel, #confirm-dialog").off(".confirm");
        confirmDialog.close();
        resolve(answer);
      };
      $("#confirm-ok").on("click.confirm", function () { finish(true); });
      $("#confirm-cancel").on("click.confirm", function () { finish(false); });
      $(confirmDialog).on("cancel.confirm", function (event) {
        event.preventDefault();
        finish(false);
      });
      confirmDialog.showModal();
      $("#confirm-cancel").trigger("focus");
    });
  }

  function renderTable() {
    const query = $("#titan-search").val().trim().toLowerCase();
    const body = $("#titan-rows").empty();
    let count = 0;
    titans.forEach(function (titan, index) {
      const text = fields.map(function (field) { return titan[field]; }).join(" ").toLowerCase();
      const group = titan.status === "Active" ? "active" : "other";
      if (!text.includes(query) || (category !== "all" && category !== group)) return;
      const row = $("<tr>");
      fields.forEach(function (field, column) {
        const cell = column === 0 ? $("<th>").attr("scope", "row") : $("<td>");
        row.append(cell.text(titan[field]));
      });
      const actions = $("<td>").addClass("row-actions");
      actions.append($("<button>").attr({ type: "button", "aria-label": "Edit " + titan.power }).addClass("btn edit-titan").data("index", index).text("Edit"));
      actions.append($("<button>").attr({ type: "button", "aria-label": "Delete " + titan.power }).addClass("btn delete-titan").data("index", index).text("Delete"));
      body.append(row.append(actions));
      count++;
    });
    $("#record-count").text(count + " of " + titans.length + " records");
    $("#no-records").prop("hidden", count !== 0);
  }
  function resetEditor() {
    editIndex = -1;
    titanForm.reset();
    $("#save-titan").text("Add Titan");
    $("#cancel-edit").prop("hidden", true);
  }
  $("#titan-search").on("input", renderTable);
  $("[data-category]").on("click", function () {
    category = $(this).data("category");
    $("[data-category]").removeClass("active").attr("aria-pressed", false);
    $(this).addClass("active").attr("aria-pressed", true);
    renderTable();
  });
  $(titanForm).on("input change", function () {
    $(this).find("input").each(function () { this.setCustomValidity(""); });
  });
  $(titanForm).on("submit", function (event) {
    event.preventDefault();
    const record = {};
    fields.forEach(function (field) {
      const input = titanForm.elements.namedItem(field);
      record[field] = input.value.trim();
      input.setCustomValidity(record[field] ? "" : "Please fill in this field.");
    });
    if (!titanForm.reportValidity()) return;
    if (editIndex === -1) titans.push(record);
    else titans[editIndex] = record;
    saveTitans();
    $("#table-status").text(editIndex === -1 ? "Record added." : "Record updated.");
    resetEditor();
    $("#titan-search").val("");
    $("[data-category='all']").trigger("click");
  });
  $("#titan-rows").on("click", ".edit-titan", function () {
    editIndex = $(this).data("index");
    fields.forEach(function (field) {
      titanForm.elements.namedItem(field).value = titans[editIndex][field];
      titanForm.elements.namedItem(field).setCustomValidity("");
    });
    $("#titan-editor").prop("open", true);
    $("#save-titan").text("Save changes");
    $("#cancel-edit").prop("hidden", false);
    titanForm.elements.namedItem("power").focus();
  });
  $("#titan-rows").on("click", ".delete-titan", async function () {
    const index = $(this).data("index");
    const name = titans[index].power;
    const confirmed = await askConfirm("Delete record?", "Delete “" + name + "” from the Titan table? You can restore the original records later.", "Delete");
    if (!confirmed) return;
    titans.splice(index, 1);
    saveTitans();
    resetEditor();
    renderTable();
    $("#table-status").text("Record deleted.");
  });
  $("#reset-titans").on("click", async function () {
    const confirmed = await askConfirm("Restore original records?", "Your added, edited and deleted records will be replaced by the original nine.", "Restore");
    if (!confirmed) return;
    titans = copyTitans(defaultTitans);
    store.remove(KEYS.titans);
    resetEditor();
    $("#titan-search").val("");
    $("[data-category='all']").trigger("click");
    $("#table-status").text("Original records restored.");
  });
  $("#cancel-edit").on("click", resetEditor);
  renderTable();
}

/* ---------- Registration form ---------- */
const recruitForm = document.querySelector("#recruit-form");
if (recruitForm) {
  const fields = $(recruitForm).find(".form-control, .form-select").toArray();
  const password = recruitForm.elements.namedItem("password");
  const confirmation = recruitForm.elements.namedItem("confirmation");
  let recruitCard = "";
  $("#create-card").prop("disabled", false);

  // Signed-in users get their name and email filled in
  function prefillFromAccount() {
    const user = getUser();
    if (!user) return;
    const nameInput = recruitForm.elements.namedItem("name");
    const emailInput = recruitForm.elements.namedItem("email");
    if (!nameInput.value) nameInput.value = user.name;
    if (!emailInput.value) emailInput.value = user.email;
  }
  prefillFromAccount();
  $(document).on("sca:auth", prefillFromAccount);

  function checkField(input) {
    let error = "";
    const value = input.value.trim();
    if (!value) error = "Please fill in this field.";
    else if (input.name === "name" && value.length < 2) error = "Enter at least 2 characters.";
    else if (input.name === "email" && !EMAIL_PATTERN.test(value)) error = "Enter a valid email, like scout@example.com.";
    else if (input.name === "password" && input.value.length < 8) error = "Use at least 8 characters.";
    else if (input.name === "confirmation" && input.value !== password.value) error = "Passwords do not match.";
    else if (input.name === "message" && value.length < 10) error = "Write at least 10 characters.";
    input.setCustomValidity(error);
    const valid = input.checkValidity();
    $(input).toggleClass("is-invalid", !valid).toggleClass("is-valid", valid).attr("aria-invalid", !valid);
    $("#" + input.id + "-feedback").text(valid ? "Looks good." : (error || input.validationMessage))
      .toggleClass("error", !valid).toggleClass("success", valid);
    return valid;
  }
  $(fields).on("input change", function () {
    checkField(this);
    if (this === password) {
      const value = password.value;
      const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(function (rule) { return rule.test(value); }).length;
      let strength = value ? 1 : 0;
      if (value.length >= 8 && types >= 2) strength = 2;
      if (value.length >= 10 && types === 4) strength = 3;
      $("#password-meter").val(strength);
      $("#password-strength").text(["Use 8+ characters. Mix letters, numbers and symbols.", "Weak", "Medium", "Strong"][strength]);
      if (confirmation.value) checkField(confirmation);
    }
  });
  $(recruitForm).on("input change", function () {
    $("#form-status, #form-error").prop("hidden", true);
    recruitCard = "";
  });
  $(recruitForm).on("submit", function (event) {
    event.preventDefault();
    fields.forEach(checkField);
    if (!recruitForm.reportValidity()) {
      $("#form-error").prop("hidden", false);
      return;
    }
    const name = recruitForm.elements.namedItem("name").value.trim();
    const regiment = recruitForm.elements.namedItem("regiment").value;
    $("#recruit-name").text(name);
    $("#recruit-regiment").text(regiment);
    recruitCard = "SURVEY CORPS RECRUIT CARD\nName: " + name + "\nRegiment: " + regiment + "\n\nUnofficial fan activity.";
    $("#form-status").prop("hidden", false).trigger("focus");
  });
  $(recruitForm).on("reset", function () {
    fields.forEach(function (input) {
      input.setCustomValidity("");
      $(input).removeClass("is-valid is-invalid").removeAttr("aria-invalid");
    });
    $(".field-feedback").text("").removeClass("error success");
    $("#password-meter").val(0);
    $("#password-strength").text("Use 8+ characters. Mix letters, numbers and symbols.");
    $("#form-status, #form-error").prop("hidden", true);
    recruitCard = "";
  });
  $("#download-card").on("click", function () {
    if (!recruitCard) return;
    const url = URL.createObjectURL(new Blob([recruitCard], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "survey-corps-recruit-card.txt";
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
}
