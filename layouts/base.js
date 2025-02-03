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
    this.targetedLocations = config.targetedLocations;
    this.analytics = {
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
        },
      },
      createConversionTracker: () => {
        const links = document.querySelectorAll(`a[href*="${this.hostname}"]`);
        links.forEach((link) => {
          link.addEventListener("click", (event) => {
            event.preventDefault();
            this.analytics.events.conversion(this.article.title);
            window.location.href = event.target.href;
          });
        });
      },
      init: () => {
        window.dataLayer = window.dataLayer || [];
        this.analytics.createConversionTracker();
      },
    };
  }
  async fetchHandler(query, variables) {
    console.log(variables);
    const resp = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });
    if (!resp.ok) {
      const r = await resp.json();
      console.log(r?.errors);
      throw new Error(`Article Creation: hygraph fetch failed, 
        
        ${r?.errors[0]?.message}`);
    }
    const json = await resp.json();
    return json;
  }
  trimExcerpt = (text) => {
    const trimIndex = 132;
    if (text.length > trimIndex) {
      const findIndexOfNextSpace = () => {
        //look from trim index to the end to find next space
        for (let i = trimIndex; i < text.length - 1; i++) {
          if (text[i] === " ") {
            return i;
          }
        }
      };
      //return truncated string sliced down to nearest space, and append ellipsis
      return text.slice(0, findIndexOfNextSpace()) + "...";
    }
    return text;
  };
  transformDomainToHygraphAPIRef() {
    switch (this.domain) {
      case "findhomepros.com":
        return "findhomeprosCom";
      case "protect.com":
        return "protectCom";
      case "free-insurance-quotes.us":
        return "freeInsuranceQuotesUs";
      case "simplyjobs.com":
        return "simplyjobsCom";
      case "searchmynewjob.com":
        return "searchmynewjobCom";
      default:
        throw new Error("Article Creation: Domain not found/invalid");
    }
  }
  substitution(content, definitions = []) {
    let modifiedContent = content;
    if (content) {
      if (definitions.length === 0) {
        definitions.push({
          variable: "year",
          value: new Date().getFullYear(),
        });
      }
      definitions.forEach((definition) => {
        modifiedContent = content.replace(/{{\s*(\w+)\s*}}/g, (_, subKey) => {
          console.log(_, subKey);
          return definition.value || "";
        });
      });
    }
    return modifiedContent;
  }
}
