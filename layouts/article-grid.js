"use strict";

import { ArticleController } from "./base.js";
import { Article } from "./article-single.js";
import {
  scrollToHeader,
  createNode,
  createDate,
  createNoArticlesMessage,
  uppercaseTagValue,
} from "../main.js";

export class ArticleGrid extends ArticleController {
  constructor(config = null) {
    super(config);
    this.articles = [];
    this.gridTitle = "Latest Articles";
    this.__effects = {
      articles: {
        createArticleGridUrl: () => {
          window.history.pushState({}, "", "/articles");
        },
        buildArticleGrid: () => {
          const buildGridOfArticles = (articleObj) => {
            const excerpt = createNode("p", { class: "article-excerpt" });
            excerpt.textContent = this.trimExcerpt(articleObj.excerpt);
            const title = createNode("h2", { class: "article-title" });
            title.textContent = this.substitution(articleObj.title);
            const publishedDate = createNode("p", {
              class: "article-date article-metadata",
            });
            publishedDate.textContent = createDate(
              articleObj.publishedAt ?? articleObj.date
            );
            const imageContainer = createNode("div", {
              class: "article-cover-img-container",
            });
            const image = createNode("img", {
              class: "article-cover-img",
              // style: "max-width:100%;width:100%;display:block",
            });
            image.src = articleObj?.coverImage?.url;
            const articleContent = createNode("div", {
              class: "article-card",
              id: articleObj.id,
            });
            const articleLink = createNode("a", {
              href: "javascript:void(0)",
            });
            const continueReadingLink = createNode("p", {
              class: "continue-reading",
            });
            continueReadingLink.textContent = "Continue Reading";
            articleLink.addEventListener("click", this.events.click);
            const articleContainer = document.querySelector(
              ".articles-container.grid > .wrapper"
            );
            articleContainer.classList.add("article-grid");
            if (articleObj?.coverImage?.url) imageContainer.appendChild(image);
            articleLink.appendChild(imageContainer);
            articleLink.appendChild(title);
            //articleLink.appendChild(publishedDate);
            articleLink.appendChild(excerpt);
            articleLink.appendChild(continueReadingLink);
            articleContent.appendChild(articleLink);
            articleContainer.append(articleContent);
          };
          for (const article of this.articles) {
            buildGridOfArticles(article);
          }
        },
      },
      gridTitle: {
        updateGridTitle: () => {
          document.querySelector(
            ".article-grid-title"
          ).innerHTML = `<h3 style="text-align:center">${this.gridTitle}</h3>`;
        },
      },
    };
    this.events = {
      click: (ev) => {
        utilities.setArticleLoadingState(true);
        const parentElement = ev.target.closest(".article-card");
        const newArticleFromState = this.articles.find(
          (article) => article.id === parentElement.id
        );
        const newArticleSlug = newArticleFromState.urlSlug;
        if (!window.location.hostname.includes("preview")) {
          window.location.href = `article/${newArticleSlug}`;
        } else {
          const pageState = Impressure.context.getState();
          window.__articlesData__.articleSingle.slug = newArticleSlug;
          if (
            pageState.pages[pageState.navigation.currentPageId].name !==
            "article"
          ) {
            Impressure.commands.nextPage();
          } else {
            document.querySelector(".regionHeader").scrollIntoView();
            document.querySelector(
              ".articles-container.single > .wrapper"
            ).innerHTML = "";
            document.querySelector(
              ".articles-container.grid > .wrapper"
            ).innerHTML = "";
            Impressure.commands.processIntegrations();
          }
        }
      },
    };
  }
}
