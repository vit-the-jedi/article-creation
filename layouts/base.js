"use strict";

import { articleRefs } from "../main";

export class ArticleController {
  constructor(config) {
    this.vertical = config.vertical;
    this.subvertical = config.subvertical;
    this.articleType = config.articleType;
    this.apiUrl = config.apiUrl;
    this.domain = config.domain;
    this.hostname = config.domain;
    this.gaId = config.gaId;
    this.analytics = {
      init: () => {
        window.dataLayer = window.dataLayer || [];
      },
      events: {
        view: (title) => {
          window.dataLayer.push({
            event: "articleView",
            articleTitle: title,
          });
        },
        conversion: (title) => {
          window.dataLayer.push({
            event: "articleConversion",
            articleTitle: title,
          });
        }
      }
    }
  }
  createConversionTracker = () => {
    const links = document.querySelectorAll(`a[href*="${this.hostname}"]`);
    links.forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.analytics.events.conversion(this.article.title);
        window.location.href = event.target.href;
      });
    });
  }
  async fetchHandler(query) {
    const resp = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    });
    if (!resp.ok) throw new Error("Article Creation: hygraph fetch failed");
    const json = await resp.json();
    return json;
  }
  trimExcerpt = (text) => {
    const trimIndex = 132;
    if(text.length > trimIndex){
      const findIndexOfNextSpace = () => {
        //look from trim index to the end to find next space
        for (let i = trimIndex; i < text.length - 1; i++){
          if (text[i] === " "){
            return i;
          }
        }
      }
      //return truncated string sliced down to nearest space, and append ellipsis
      return text.slice(0,findIndexOfNextSpace()) + "...";
    }
    return text;
  }
  transformDomainToHygraphAPIRef() {
    switch (this.domain) {
      case "findhomepros.com":
        return "findhomeprosCom";
      case "protect.com":
        return "protectCom";
      case "free-insurance-quotes.us":
        return "freeInsuranceQuotesUs";
      default:
        throw new Error("Article Creation: Domain not found/invalid");
    }
  }
}
