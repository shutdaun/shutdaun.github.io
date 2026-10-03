"use strict";

const STRINGS = {
  ru: {
    open: "Расширения Firefox",
    extText: "Российские сайты напрямую, остальное через SOCKS5",
    go: "Описание",
    back: "Назад",
    tag: "Российские сайты напрямую, остальное через SOCKS5",
    copy: "Скопировать ссылку",
    copied: "Скопировано",
    close: "Закрыть",
  },
  en: {
    open: "Firefox extensions",
    extText: "Russian sites direct, everything else through SOCKS5",
    go: "Read more",
    back: "Back",
    tag: "Russian sites direct, everything else through SOCKS5",
    copy: "Copy link",
    copied: "Copied",
    close: "Close",
  },
};

const KEY = "site-lang";

function storedLang() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "en" || saved === "ru" ? saved : "ru";
  } catch {
    return "ru";
  }
}

function applyLang(lang) {
  const dict = STRINGS[lang];

  document.documentElement.lang = lang;

  for (const node of document.querySelectorAll("[lang]")) {
    if (node !== document.documentElement) node.hidden = node.getAttribute("lang") !== lang;
  }

  for (const node of document.querySelectorAll("[data-i18n]")) {
    const value = dict[node.dataset.i18n];
    if (value) node.textContent = value;
  }

  for (const node of document.querySelectorAll("[data-i18n-close]")) {
    node.setAttribute("aria-label", dict.close);
  }

  for (const btn of document.querySelectorAll("[data-lang]")) {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  }

  try {
    localStorage.setItem(KEY, lang);
  } catch {
    return;
  }
}

for (const btn of document.querySelectorAll("[data-lang]")) {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
}

applyLang(storedLang());

const modal = document.querySelector("[data-modal]");
const opener = document.querySelector("[data-open]");

if (modal && opener) {
  const card = modal.querySelector(".modal__card");

  const open = () => {
    modal.hidden = false;
    document.body.classList.add("is-locked");
    card.querySelector("[data-close]").focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    opener.focus();
  };

  opener.addEventListener("click", open);

  for (const node of modal.querySelectorAll("[data-close]")) {
    node.addEventListener("click", close);
  }

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const items = Array.from(card.querySelectorAll("a[href], button"));
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

for (const btn of document.querySelectorAll("[data-copy]")) {
  const label = btn.querySelector("[data-copy-label]");
  let timer = 0;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch {
      return;
    }

    label.dataset.i18n = "copied";
    label.textContent = STRINGS[document.documentElement.lang].copied;

    clearTimeout(timer);
    timer = setTimeout(() => {
      label.dataset.i18n = "copy";
      applyLang(document.documentElement.lang);
    }, 2000);
  });
}
