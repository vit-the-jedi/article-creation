"use strict";

import { ArticleController } from "./base.js";
import { ArticleGrid } from "./article-grid.js";
import {
  createNode,
  createDate,
  scrollToHeader,
  watchForHistoryChange,
} from "../main.js";

export class Article extends ArticleController {
  constructor(config = null) {
    super(config);
    this.article = {};
    this.urlSlug = "";
    this.loading = true;
    this.error = false;
    this.__effects = {
      urlSlug: {
        getNewArticle: async () => {
          const articleResp = await this.fetchHandler(
            this.__query,
            this.__queryVariables
          );
          if (articleResp.errors) {
            this.error = true;
          } else {
            this.error = false;
            this.article = articleResp.data.article[0];
          }
        },
      },
      article: {
        createArticleUrl: () => {
          window.history.pushState({}, "", `/article/${this.article.urlSlug}`);
        },
        buildArticle() {
          const buildArticleAndAppend = (articleObj) => {
            const html = createNode("div", { class: "article-content" });
            html.innerHTML = articleObj.content.html;
            const cta = [...html.querySelectorAll("a")]
              .map((tag) => {
                const possibleCtaArray = ["compare rates", "compare quotes"];
                console.log(tag.textContent.toLowerCase().replaceAll(">", ""));
                let text = tag.textContent.toLowerCase().replaceAll(">", "");
                if (text[text.length - 1] === " ") text = text.slice(0, -1);
                if (possibleCtaArray.includes(text)) {
                  return tag;
                }
              })
              .filter((cta) => cta);
            cta.forEach((a) => {
              a.classList.add("btn", "btn-primary");
            });
            const title = createNode("h2", { class: "article-title" });
            title.textContent = this.substitution(articleObj.title);
            const image = createNode("img", {
              class: "article-cover-img",
              style: "max-width:100%;width:100%;display:block",
            });
            image.src = articleObj?.coverImage?.url;
            if (articleObj?.secondaryImage?.url) {
              const secondaryImage = createNode("img", {
                class: "article-secondary-img",
              });
              secondaryImage.src = articleObj.secondaryImage.url;
            }
            const date = createNode("p", {
              class: "article-date article-metadata",
            });
            date.textContent = createDate(articleObj.date);
            const articleContent = createNode("div", {
              class: "article",
              id: articleObj.id,
            });
            const articleMetadata = createNode("div", {
              class: "article-tag-container",
            });
            articleObj.contentTag.forEach((tag) => {
              const tagNode = createNode("span", {
                class: "article-tag article-metadata",
              });
              tagNode.textContent = tag.tagValue;
              tagNode.dataset.tag = tag.tagValue;
              tagNode.addEventListener("click", this.events.tagClick);
              articleMetadata.appendChild(tagNode);
            });
            articleMetadata.prepend(date);
            const articleContainer = document.querySelector(
              ".articles-container.single > .wrapper"
            );
            articleContent.appendChild(title);
            if (articleObj?.coverImage?.url) articleContent.appendChild(image);
            articleContent.appendChild(html);
            articleContainer.append(articleContent);
            articleContainer.append(articleMetadata);
            //SETLOADING(FALSE)
          };
          //build the one article we have
          buildArticleAndAppend(this.article);
          // watchForHistoryChange(this.events.historyChange);
        },
      },
    };
    this.__query = `query getArticleWithRelated($stage: Stage!, $targetedLocation: [Locations!], $domain: Domain!, $urlSlug: String, $vertical: String, $subvertical: String, $article: ArticleTypes!) {
      article: articles(
        where: {
          vertical: $vertical, 
          subvertical: $subvertical, 
          articleType: $article, 
          urlSlug: $urlSlug, 
          domain: $domain,
        }
        stage: $stage
        orderBy: updatedAt_DESC
      ) {
        id
        urlSlug
        title
        secondaryImage {
          url
        }
        articleType
        readTime
        publishedAt
        excerpt
        date
        coverImage {
          url
        }
        contentTag(first: 5) {
          id
          tagValue
        }
        content {
          html
        }
        locationTags
      }
      relatedArticles: articles(
        where: {
                OR: [{ locationTags_contains_some: $targetedLocation }, { locationTags: [] }]
          vertical: $vertical, subvertical: $subvertical, articleType: article, domain: $domain, NOT: {urlSlug: $urlSlug}}
        first: 100
        stage: $stage
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
        locationTags
      }
    }`;
    this.__queryVariables = {
      stage: "DRAFT",
      vertical: "insurance",
      subvertical: "auto-insurance",
      article: "article",
      domain: "freeInsuranceQuotesUs",
      urlSlug: this.urlSlug,
    };
    this.events = {
      tagClick: (ev) => {
        scrollToHeader();
        destroyArticle(
          articleRefs.getInstance(Article),
          document.querySelector(".articles-container.single > .wrapper")
        );
        destroyArticle(
          articleRefs.getInstance(ArticleGrid),
          document.querySelector(".articles-container.grid > .wrapper")
        );
        const createArticleGridEvent = new CustomEvent("createArticleGrid", {
          detail: {
            tag: ev.target.dataset.tag,
          },
        });
        document.dispatchEvent(createArticleGridEvent);
      },
      historyChange: (ev) => {
        scrollToHeader();
        destroyArticle(
          Article,
          document.querySelector(".articles-container.single > .wrapper")
        );
        destroyArticle(
          ArticleGrid,
          document.querySelector(".articles-container.grid > .wrapper")
        );
        const createArticleGridEvent = new CustomEvent("createArticleGrid");
        document.dispatchEvent(createArticleGridEvent);
        document.dispatchEvent(new CustomEvent("removeArticlesBackButton"));
        window.removeEventListener("popstate", this);
      },
    };
  }
}
