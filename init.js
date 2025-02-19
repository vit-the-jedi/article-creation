"use strict";

import { articleSingle, articleGrid, getSlugFromUrl } from "./main.js";

const initializeGrid = function () {
  articleGrid.fetch = true;
};
const initializeSingle = function () {
  articleSingle.urlSlug = getSlugFromUrl();
};

window.initializeGrid = initializeGrid;
window.initializeSingle = initializeSingle;
