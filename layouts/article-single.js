"use strict";

import { ArticleController } from "./base.js";
import { ArticleGrid } from "./article-grid.js";
import {
  destroyArticle,
  articleRefs,
  createNode,
  createDate,
  scrollToHeader,
  watchForHistoryChange,
} from "../main.js";

export class Article extends ArticleController {
  constructor(config) {
    super(config);
    this.urlSlug = config.urlSlug;
    this.article = null;
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
  buildArticle(articleResp, appendContainerSelector = null) {
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
    buildArticleAndAppend(articleResp);
    watchForHistoryChange(this.events.historyChange);
  }
  async build({ slug, tags } = eventDetails) {
    this.urlSlug = slug;
    this.relatedArticles = null;
    //query needs to be updated to include tags if they are present
    this.query = `query getArticleWithRelated($stage: Stage!, $targetedLocation: [Locations!], $domain: Domain!, $urlSlug: String, $vertical: String, $subvertical: String, $article: ArticleTypes!) {
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
    const variables = {
      stage: "DRAFT",
      vertical: this.vertical,
      subvertical: this.subvertical,
      article: this.articleType,
      targetedLocation: this.targetedLocations
        ? this.targetedLocations.map((loc) => loc.toLowerCase())
        : null,
      urlSlug: slug,
      domain: this.domain,
    };
    const hygraphResp = await this.fetchHandler(this.query, variables);
    if (hygraphResp.data.article[0].contentTag.length > 0) {
      this.relatedArticlesQuery = `query GetRelatedArticles {
        articles(
          stage: DRAFT
          first: 3
          orderBy: date_ASC
          where: { NOT: {urlSlug: "${this.urlSlug}"}, vertical: "${
        this.vertical
      }", subvertical: "${this.subvertical}", articleType: ${
        this.articleType
      }, domain: ${
        this.domain
      }, contentTag_some: { tagValue_in: ${JSON.stringify(
        tags ||
          hygraphResp.data.articles[0].contentTag.map((tag) => tag.tagValue)
      )}}}
        ) {
          id
          urlSlug
          title
          secondaryImage {
            url
          }
          readTime
          publishedAt
          excerpt
          date
          coverImage {
            url
          }
          content {
            html
          }
          contentTag {
            tagValue
          }
        }
      }`;
    }
    this.article = hygraphResp.data.article[0];
    this.relatedArticles = await this.fetchHandler(
      this.relatedArticlesQuery,
      variables
    );
    this.buildArticle(this.article);
  }
}
