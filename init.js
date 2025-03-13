"use strict";
import { Article } from "./layouts/article-single";
import { ArticleGrid } from "./layouts/article-grid";
import { articleLoader } from "./loaders/loader.js";
import { getSlugFromUrl } from "./main.js";
import * as lightweight_reactivity from "@vit-the-jedi-tools/lightweight-reactivity";

const reactive = lightweight_reactivity.reactive;

let userConfig = {};
const articleSingle = reactive(new Article());
const articleGrid = reactive(new ArticleGrid());
const loader = reactive(articleLoader);
const initializeGrid = function (config) {
  Object.assign(userConfig, config);
  articleGrid.fetch = true;
};
const initializeSingle = function (config) {
  Object.assign(userConfig, config);
  articleSingle.urlSlug = getSlugFromUrl();
};

window.initializeGrid = initializeGrid;
window.initializeSingle = initializeSingle;

export { articleSingle, articleGrid, loader, reactive, userConfig };
