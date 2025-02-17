"use strict";

import { articleSingle, articleGrid, loader, getSlugFromUrl } from "./main.js";

const initializeGrid = function () {
  loader.layout = "grid";
  articleGrid.fetch = true;
};
const initializeSingle = function () {
  loader.layout = "single";
  articleSingle.urlSlug = getSlugFromUrl();
};

window.initializeGrid = initializeGrid;
window.initializeSingle = initializeSingle;
