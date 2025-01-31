"use strict";

import { Article } from "./layouts/article-single";
import { ArticleGrid } from "./layouts/article-grid";
import "./styles/base.css";

let impressureRouteFromUrl;

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

export const createArticleHandler = async (articleConfig, eventDetails) => {
  document.body.classList.add("articles-loading");
  document.querySelector(".articles-container.single").prepend(createLoader());
  createArticleUrl(eventDetails.slug);
  const articleInstance = new Article(articleConfig);
  await articleInstance.build(eventDetails);
  articleRefs.storeInstance(Article, articleInstance);
  const relatedArticles =
    articleRefs.getInstance(Article).relatedArticles.data.articles;
  if (relatedArticles.length > 0) {
    createArticleGridHandler(
      articleConfig,
      relatedArticles,
      "Related Articles"
    );
  } else {
    articleRefs.deleteInstance(ArticleGrid);
    updateGridTitle("");
  }
  removeLoader();
  articleInstance.analytics.init();
  articleInstance.analytics.events.view(
    articleRefs.getInstance(Article).article.title
  );
};

export const createArticleGridHandler = async (
  articleConfig,
  relatedArticles,
  gridTitle
) => {
  document.querySelector(".articles-container.grid").prepend(createLoader());
  if (relatedArticles) {
    const articleGridInstanceWithRelated = new ArticleGrid(
      articleConfig,
      relatedArticles
    );
    await articleGridInstanceWithRelated.build();
    articleRefs.storeInstance(ArticleGrid, articleGridInstanceWithRelated);
  } else {
    const articleGridInstance = new ArticleGrid(articleConfig);
    await articleGridInstance.build();
    articleRefs.storeInstance(ArticleGrid, articleGridInstance);
  }
  updateGridTitle(gridTitle);
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

const resetArticleUrl = () => {
  window.history.pushState({}, "", "/articles");
};

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
      class: "back-btn articles-back-btn",
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

export const watchForHistoryChange = (callback) => {
  window.addEventListener("popstate", callback);
};

window.initializeArticles = async (config) => {
  console.log(config);
  impressureRouteFromUrl = config.impressureRouteFromUrl;
  //SETLOADIN(TRUE)
  //user navigating to specific article page
  //fetch specific article based onn route, else show all articles for domain
  document.addEventListener("createArticle", (e) => {
    createArticleHandler(config, e.detail);
    createBackButton(config);
  });
  document.addEventListener("createArticleGrid", (e) => {
    console.log(`createArticleGrid event`, e.detail);
    let title;
    if (e?.detail?.tag) {
      config.tag = e.detail.tag;
      title = uppercaseTagValue(e.detail.tag) + " Articles";
    } else {
      title = "Latest Articles";
    }
    createArticleGridHandler(config, null, title);
    createBackButton(config);
  });
  document.addEventListener("removeArticlesBackButton", () => {
    const backBtn = document.querySelector(".articles-back-btn");
    const c = document.querySelector(".articles-container.grid");
    c.removeChild(backBtn);
  });
  if (
    window.location.pathname.split("/")[1] === "article" ||
    impressureRouteFromUrl === "article"
  ) {
    const slug =
      impressureRouteFromUrl === "article"
        ? "best-free-cheap-auto-insurance-in-affordable-options-for-2024"
        : getSlugFromUrl();
    if (slug) {
      createArticleHandler(config, { slug: slug, tags: null });
      createBackButton(config);
    } else {
      console.warn(`No slug found in URL, redirecting to articles`);
      resetArticleUrl();
      createArticleGridHandler(config, null, "Latest Articles");
    }
  } else {
    createArticleGridHandler(config, null, "Latest Articles");
  }
};
