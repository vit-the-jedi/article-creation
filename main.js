"use strict";

import { Article } from "./layouts/article-single";
import { ArticleGrid } from "./layouts/article-grid";
import "./styles/base.css";

class InstanceStore {
  constructor() {
    this.store = new Map();
  }

  // Store an instance by class constructor
  storeInstance(cls, instance) {
    this.store.set(cls, instance); // cls is the key, instance is the value
  }

  // Retrieve an instance by class constructor
  getInstance(cls) {
    return this.store.get(cls);
    // cls is the key, get the corresponding value (instance)
  }

  deleteInstance(cls) {
    this.store.delete(cls);
  }
  state() {
    return this.store;
  }
}

export const articleRefs = new InstanceStore();
const i = 0;

export const createArticleHandler = async (articleConfig, slug) => {
  document.querySelector(".articles-container.single").prepend(createLoader());
  createArticleUrl(slug);
  const articleInstance = new Article(articleConfig);
  await articleInstance.build(slug);
  articleRefs.storeInstance(Article, articleInstance);
  const relatedArticles =
    articleRefs.getInstance(Article).article.relatedArticles;
  if (relatedArticles.length > 0) {
    createArticleGridHandler(articleConfig, relatedArticles);
    updateGridTitle("Related Articles");
  } else {
    articleRefs.deleteInstance(ArticleGrid);
    updateGridTitle("");
  }
  removeLoader();
  articleInstance.analytics.init();
  articleInstance.analytics.events.view(articleRefs.getInstance(Article).article.title);
  console.log(`state after creation`, articleRefs.state());
};

export const createArticleGridHandler = async (
  articleConfig,
  relatedArticles
) => {
  document.querySelector(".articles-container.grid").prepend(createLoader());
  if (relatedArticles) {
    const articleGridInstanceWithRelated = new ArticleGrid(
      articleConfig,
      relatedArticles
    );
    await articleGridInstanceWithRelated.build();
    articleRefs.storeInstance(ArticleGrid);
  } else {
    const articleGridInstance = new ArticleGrid(articleConfig);
    await articleGridInstance.build();
    articleRefs.storeInstance(ArticleGrid, articleGridInstance);
    updateGridTitle("Latest Articles");
  }
  removeLoader();
};

//destroy article instance and remove from map
//need to call this for each instance on the map
export const destroyArticle = (articleRef, container) => {
  articleRefs.deleteInstance(articleRef);
  container.innerHTML = "";
};

const createArticleUrl = (slug) => {
  window.history.pushState({}, "", `/article/${slug}`);
};

export const scrollToHeader = () => {
  const pageHeader =
    document.querySelector(".regionHeader") || document.querySelector("header");
  if (pageHeader) pageHeader.scrollIntoView();
};

export const createBackButton = (articleConfig) => {
  if (!document.querySelector(".articles-back-btn")) {
    const back = createNode("button", {
      type: "button",
      class: "back-btn articles-back-btn",
    });
    back.textContent = "Back to Articles";
    back.addEventListener("click", function (ev) {
      ev.preventDefault();
      scrollToHeader();
      destroyArticle(
        articleRefs.getInstance(Article),
        document.querySelector(".articles-container.single > .wrapper")
      );
      destroyArticle(
        articleRefs.getInstance(ArticleGrid),
        document.querySelector(".articles-container.grid > .wrapper")
      );
      createArticleGridHandler(articleConfig);
      document.querySelector(".articles-container.grid").removeChild(ev.target);
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
  document.querySelector(".loader").remove();
}

window.initializeArticles = async (config) => {
  //SETLOADIN(TRUE)
  //user navigating to specific article page
  //fetch specific article based onn route, else show all articles for domain
  const impressureRouteFromUrl =
    new URLSearchParams(window.location.search).get("route") || null;

  document.addEventListener("createArticle", (e) => {
    createArticleHandler(config, e.detail);
    createBackButton(config);
  });
  if (
    window.location.pathname.split("/")[1] === "article" ||
    impressureRouteFromUrl === "article"
  ) {
    const slug =
      impressureRouteFromUrl === "article"
        ? "best-free-cheap-auto-insurance-in-affordable-options-for-2024"
        : window.location.pathname.split("/")[2];
    createArticleHandler(config, slug);
    createBackButton(config);
  } else {
    createArticleGridHandler(config);
  }
};
