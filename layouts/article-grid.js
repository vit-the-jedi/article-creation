"use strict";

import { ArticleController } from "./base.js";
import { articleSingle, loader, userConfig } from "../init.js";

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
    this.loading = true;
    this.error = null;
    this.gridTitle = "Latest Articles";
    this.fetch = false;
    this.__effects = {
      fetch: {
        initConfig: function () {
          if (!this.config) {
            this.config = userConfig;
          }
        },
        fetchOnInit: async function () {
          if (this.fetch) {
            loader.layout = "grid";
            loader.loading = true;
            const variables = {
              stage: "DRAFT",
              vertical: this.config.vertical,
              subvertical: this.config.subvertical ?? null,
              article: this.config.articleType,
              domain: this.config.domain,
            };
            const allArticlesResp = await this.fetchHandler(
              this.__query,
              variables
            );
            if (allArticlesResp.errors) {
              this.error = true;
            } else {
              this.error = false;
              this.articles = allArticlesResp.data.articles;
            }
            this.fetch = false;
            loader.loading = false;
          }
        },
      },
      articles: {
        buildArticleGrid: function () {
          const articleGridTitle = createNode("div", {
            class: "article-grid-title",
          });
          const articleGridText = createNode("h3", {
            class: "article-grid-text",
            style: "text-align:center",
          });
          articleGridText.textContent = this.gridTitle;
          articleGridTitle.appendChild(articleGridText);
          const articleGridContainer = createNode("div", {
            class: "article-grid-container",
          });
          const articleGridNode = createNode("div", {
            class: "article-container article-grid grid",
          });
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
            const articleContainer = createNode("div", {
              class: "article-item",
            });
            if (articleObj?.coverImage?.url) imageContainer.appendChild(image);
            articleLink.appendChild(imageContainer);
            articleLink.appendChild(title);
            //articleLink.appendChild(publishedDate);
            articleLink.appendChild(excerpt);
            articleLink.appendChild(continueReadingLink);
            articleContent.appendChild(articleLink);
            articleContainer.append(articleContent);
            return articleContainer;
          };
          if (this.articles && this.articles.length > 0) {
            const createdArticles = this.articles.map((article) => {
              return buildGridOfArticles(article);
            });
            createdArticles.forEach((article) => {
              articleGridNode.appendChild(article);
            });
            loader.loading = false;
            articleGridContainer.appendChild(articleGridNode);
            articleGridContainer.prepend(articleGridTitle);
            document
              ?.querySelector(".articles-append-target")
              .appendChild(articleGridContainer);
            this.gridTitle = "Latest Articles";
          } else {
            this.fetch = true;
          }
        },
        createArticleGridUrl: function () {
          if (this.fetch) {
            window.history.pushState({}, "", "/articles");
          }
        },
      },
      gridTitle: {
        updateGridTitle: function () {
          document.querySelector(".article-grid-text").textContent =
            this.gridTitle;
        },
      },
    };
    this.__query = `query GetAllArticles($stage: Stage!, $targetedLocation: [Locations!], $domain: Domain!, $vertical: String, $subvertical: String, $article: ArticleTypes!) {
      articles(
        stage: $stage
        orderBy: date_ASC
        where: {
        OR: [{ locationTags_contains_some: $targetedLocation }, { locationTags: [] }],
          vertical: $vertical, 
          subvertical: $subvertical, 
          articleType: $article, 
          domain: $domain,
        }
    ) {
      id
      urlSlug
      title
      readTime
      publishedAt
      excerpt
      date
      coverImage {
        url
      }
    }
  }`;
    this.events = {
      click: (ev) => {
        document.querySelector(".regionHeader").scrollIntoView();
        const articleGridContainer = document.querySelector(
          ".articles-append-target"
        );
        articleGridContainer.innerHTML = "";
        const parentElement = ev.target.closest(".article-card");
        articleSingle.urlSlug = this.articles.find(
          (article) => article.id === parentElement.id
        ).urlSlug;

        window.history.pushState(
          window.history.state || {},
          `page: ${articleSingle.article.title}`,
          `/article/${articleSingle.urlSlug}`
        );
      },
    };
  }
}
