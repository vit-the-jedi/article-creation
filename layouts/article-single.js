"use strict";

import { ArticleController } from "./base.js";
import { createNode } from "../main.js";

export class Article extends ArticleController {
  constructor(config){
    super(config);
    this.urlSlug = config.urlSlug;
    this.article = null;
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
      image.src = articleObj?.coverImage.url;
      if (articleObj?.secondaryImage?.url) {
        const secondaryImage = createNode("img", {
          class: "article-secondary-img",
        });
        secondaryImage.src = articleObj.secondaryImage.url;
      }
      const date = createNode("p", {
        class: "article-date article-metadata",
      });
      date.textContent = articleObj.date;
      const articleContent = createNode("div", {
        class: "article",
        id: articleObj.id,
      });
      const articleContainer = document.querySelector(".articles-container.single > .wrapper");
      articleContent.appendChild(title);
      articleContent.appendChild(date);
      articleContent.appendChild(image);
      articleContent.appendChild(html);
      articleContainer.append(articleContent);
      //SETLOADING(FALSE)
    };
    //build the one article we have
    buildArticleAndAppend(articleResp);
  }
  async build(urlSlug){
    this.domain = this.transformDomainToHygraphAPIRef();
    this.urlSlug = urlSlug;
    this.query = `query GetArticleBySlugAndRelatedArticles {
                        articles(
                          stage: DRAFT
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
                          relatedArticles {
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
                          }
                        }
                      }`;
    const hygraphResp = await this.fetchHandler(this.query);
    console.log(`RESP:`, (hygraphResp))
    this.article = hygraphResp.data.articles[0];
    this.buildArticle(this.article);
  }
}