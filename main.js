"use strict";

import { Article } from "./layouts/article-single";
import { ArticleGrid } from "./layouts/article-grid";
import "./styles/base.css";

import * as lightweight_reactivity from "@vit-the-jedi-tools/lightweight-reactivity";

const reactive = lightweight_reactivity.reactive;

let impressureRouteFromUrl;
const i = 0;

export const scrollToHeader = () => {
  const pageHeader =
    document.querySelector(".regionHeader") || document.querySelector("header");
  if (pageHeader) pageHeader.scrollIntoView();
};

export const createNoArticlesMessage = (
  container,
  msg = "No articles found, please check back later."
) => {
  const message = createNode("p", { class: "no-articles-message" });
  message.textContent = msg;
  container.prepend(message);
};

export const uppercaseTagValue = (tag) => {
  if (tag) {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }
};
export const createBackButton = (articleConfig) => {
  if (!document.querySelector(".articles-back-btn")) {
    const back = createNode("button", {
      type: "button",
      class: "btn back-btn articles-back-btn",
    });
    back.textContent = "Back to Articles";
    back.addEventListener("click", function (ev) {
      ev.preventDefault();
      delete articleConfig.tag;
      scrollToHeader();
      destroyArticle(
        Article,
        document.querySelector(".articles-container.single > .wrapper")
      );
      destroyArticle(
        ArticleGrid,
        document.querySelector(".articles-container.grid > .wrapper")
      );
      resetArticleUrl();
      createArticleGridHandler(articleConfig, null, "Latest Articles");
      document.dispatchEvent(new CustomEvent("removeArticlesBackButton"));
    });
    document.querySelector(".articles-container.grid").appendChild(back);
  }
};

const updateGridTitle = (title) => {
  document.querySelector(
    ".article-grid-title"
  ).innerHTML = `<h3 style="text-align:center">${title}</h3>`;
};

export const createNode = (element, attributes) => {
  const node = document.createElement(element);
  for (const key in attributes) {
    node.setAttribute(key, attributes[key]);
  }
  return node;
};

const createLoader = () => {
  const loader = createNode("div", { class: "loader" });
  loader.innerHTML = `<div class="loader" style="background: url(https://impressure-c630.kxcdn.com/loading.c5de814fe527fa434435.gif) no-repeat center center / contain; height: 20px;"></div>`;
  return loader;
};
const removeLoader = () => {
  document.body.classList.remove("articles-loading");
  document.querySelector(".loader").remove();
};

export const createDate = (hygraphDate) => {
  const dateHelper = {
    days: {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    },
    months: {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December",
    },
  };
  const date = new Date(hygraphDate);
  return `Published ${dateHelper.days[date.getDay()]}, ${
    dateHelper.months[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

const getSlugFromUrl = () => {
  if (window.location.pathname.split("/").length > 3) {
    return window.location.pathname.split("/")[2];
  } else {
    return null;
  }
};

window.initializeArticles = async (type, data) => {
  window.__articlesData__ = {};
  window.__articlesData__.articleSingle = reactive(new Article());
  window.__articlesData__.articleGrid = reactive(new ArticleGrid());
  console.log(window.__articlesData__.articleSingle);
  console.log(window.__articlesData__.articleGrid);
  if (type === "article") {
    //single article logic
    window.__articlesData__.articleSingle.article = data;
  } else {
    //grid logic
    window.__articlesData__.articleGrid.articles = data;
  }
};
