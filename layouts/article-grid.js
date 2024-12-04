"use strict";

import { ArticleController } from "./base.js";
import { Article } from "./article-single.js";
import { destroyArticle, articleRefs, scrollToHeader, createNode, createDate } from "../main.js";

export class ArticleGrid extends ArticleController {
  constructor(config, data) {
    super(config);
    console.log('grid instance creation initial data', (data));
    this.articles = data;
    this.tag = config.tag ?? null;
    this.events = {
      click: (ev) => {
        const parentElement = ev.target.closest('.article-card');

        if (parentElement) {
          scrollToHeader();
          const newArticleFromState = this.articles.find((article) => article.id === parentElement.id);
          const newArticleSlug = newArticleFromState.urlSlug;
          parentElement.removeEventListener('click', this.events.click);
          const tags = newArticleFromState.contentTag.map((tag) => tag.tagValue);

          const parentArticle = articleRefs.getInstance(Article);
          if(parentArticle) destroyArticle(parentArticle, document.querySelector('.articles-container.single > .wrapper'));
          destroyArticle(articleRefs.getInstance(ArticleGrid), document.querySelector('.articles-container.grid > .wrapper'));
          const createArticleEvent = new CustomEvent('createArticle', { detail: {
            slug: newArticleSlug,
            tags: tags
          }});
          document.dispatchEvent(createArticleEvent);
        }
      }
    }
  }
  buildArticleGrid(integrationResp, appendContainerSelector = null) {
    const buildGridOfArticles = (articleObj) => {
      const excerpt = createNode("p", { class: "article-excerpt" });
      excerpt.textContent = this.trimExcerpt(articleObj.excerpt);
      const title = createNode("h2", { class: "article-title" });
      title.textContent = articleObj.title;
      const publishedDate = createNode("p", { class: "article-date article-metadata" });
      publishedDate.textContent = createDate(articleObj.publishedAt ?? articleObj.date);
      const imageContainer = createNode("div", {  class: "article-cover-img-container" });
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
      const articleContainer = document.querySelector(".articles-container.grid > .wrapper");
      articleContainer.classList.add("article-grid");
      if (articleObj?.coverImage?.url) imageContainer.appendChild(image);
      articleLink.appendChild(imageContainer);
      articleLink.appendChild(title);
      //articleLink.appendChild(publishedDate);
      articleLink.appendChild(excerpt);
      articleLink.appendChild(continueReadingLink);
      articleContent.appendChild(articleLink);
      articleContainer.append(articleContent);
      //SETLOADING(FALSE)
    };

    for (const article of integrationResp) {
      buildGridOfArticles(article);
    }
  }
  async build(){
    this.domain = this.transformDomainToHygraphAPIRef();
    this.query = `query GetAllArticles {
                        articles(
                          stage: DRAFT
                          first: 20
                          orderBy: date_ASC
                          where: {vertical: "${this.vertical}", subvertical: "${this.subvertical}", articleType: ${this.articleType}, domain: ${this.domain}}
                        ) {
                          id
                          urlSlug
                          title
                          secondaryImage {
                            url
                          }
                          contentTag {
                            tagValue
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
                        }
                      }`;
    if(this.tag){
      this.query = `query GetArticlesByTag {
        articles(
          stage: DRAFT
          first: 20
          orderBy: date_ASC
          where: {vertical: "${this.vertical}", subvertical: "${this.subvertical}", articleType: ${this.articleType}, domain: ${this.domain}, contentTag_some: {tagValue: "${this.tag}"}}
        ) {
          id
          urlSlug
          title
          secondaryImage {
            url
          }
          contentTag {
            tagValue
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
        }
      }`;
      const tagsArticlesResp = await this.fetchHandler(this.query);
      this.articles = tagsArticlesResp.data.articles;
    }else {
      //if we didn't get passed data, fetch it with the query
      //else we can assume we are building from related articles
      if(!this.articles){
        const allArticlesResp = await this.fetchHandler(this.query);
        this.articles = allArticlesResp.data.articles;
      }
    }
    console.log(this);
    this.buildArticleGrid(this.articles);
  }
}
