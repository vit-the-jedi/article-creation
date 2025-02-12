"use strict";

export class ArticleController {
  constructor(config) {
    //this.gaId = config.gaId;
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
