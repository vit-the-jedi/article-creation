"use strict";

import { ArticleController } from "./base.js";
import {ArticleGrid} from "./article-grid.js";
import { destroyArticle, articleRefs, createNode, createDate, scrollToHeader } from "../main.js";

export class Article extends ArticleController {
  constructor(config){
    super(config);
    this.urlSlug = config.urlSlug;
    this.article = null;
    this.events = {
      tagClick:(ev) => {
        scrollToHeader();
        destroyArticle(articleRefs.getInstance(Article), document.querySelector('.articles-container.single > .wrapper'));
        destroyArticle(articleRefs.getInstance(ArticleGrid), document.querySelector('.articles-container.grid > .wrapper'));
          const createArticleGridEvent = new CustomEvent('createArticleGrid', { detail: {
            tag: ev.target.dataset.tag
          }});
          document.dispatchEvent(createArticleGridEvent);
      }
    }
  }
  buildArticle(articleResp, appendContainerSelector = null) {
    const buildArticleAndAppend = (articleObj) => {
      const html = createNode("div", { class: "article-content" });
      html.innerHTML = articleObj.content.html;
      const title = createNode("h2", { class: "article-title" });
      title.textContent = articleObj.title;
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
      const articleMetadata = createNode("div", {class: "article-tag-container"});
      articleObj.contentTag.forEach((tag) => {
        const tagNode = createNode("span", {class: "article-tag article-metadata"});
        tagNode.textContent = tag.tagValue;
        tagNode.dataset.tag = tag.tagValue;
        tagNode.addEventListener("click", this.events.tagClick);
        articleMetadata.appendChild(tagNode);
      });
      articleMetadata.prepend(date);
      const articleContainer = document.querySelector(".articles-container.single > .wrapper");
      articleContent.appendChild(title);
      if(articleObj?.coverImage?.url) articleContent.appendChild(image);
      articleContent.appendChild(html);
      articleContainer.append(articleContent);
      articleContainer.append(articleMetadata);
      //SETLOADING(FALSE)
    };
    //build the one article we have
    buildArticleAndAppend(articleResp);
  }
  async build({slug, tags} = eventDetails){
    this.domain = this.transformDomainToHygraphAPIRef();
    this.urlSlug = slug;
    this.relatedArticles = null;
    //query needs to be updated to include tags if they are present
    this.query = `query GetArticleBySlug{
                        articles(
                          stage: DRAFT
                          orderBy: publishedAt_DESC
                          where: {vertical: "${this.vertical}", subvertical: "${this.subvertical}", articleType: ${this.articleType}, urlSlug: "${this.urlSlug}", domain: ${this.domain}}
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
    const hygraphResp = await this.fetchHandler(this.query);
    console.log(`ARTCILE RESP:`, (hygraphResp))
    if (hygraphResp.data.articles[0].contentTag.length > 0) {
      this.relatedArticlesQuery = `query GetRelatedArticles {
        articles(
          stage: DRAFT
          first: 3
          orderBy: date_ASC
          where: { NOT: {urlSlug: "${this.urlSlug}"}, vertical: "${this.vertical}", subvertical: "${this.subvertical}", articleType: ${this.articleType}, domain: ${this.domain}, contentTag_some: { tagValue_in: ${JSON.stringify(tags || hygraphResp.data.articles[0].contentTag.map((tag) => tag.tagValue))}}}
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
    this.article = hygraphResp.data.articles[0];
    this.relatedArticles = await this.fetchHandler(this.relatedArticlesQuery);
    console.log(`RELATED RESP:`, (this.relatedArticles));
    console.log(this);
    this.buildArticle(this.article);
  }
}