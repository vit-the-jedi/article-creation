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
    this.__effects = {
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
