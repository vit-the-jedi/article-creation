"use strict";
import { createNode } from "../main.js";
export const articleLoader = {
  loading: false,
  layout: null,
  node: null,
  __effects: {
    layout: {
      setLayout: function () {
        const loader = createNode("div", {});
        if (this.layout === "grid") {
          loader.innerHTML = this.__gridLoaderHtml;
        } else {
          loader.innerHTML = this.__singleLoaderHtml;
        }
        this.node = loader;
      },
    },
    loading: {
      setLoading: function () {
        if (this.loading) {
          document
            .querySelector(".articles-append-target")
            .appendChild(this.node);
        } else {
          document
            .querySelector(".articles-append-target")
            .removeChild(this.node);
        }
      },
    },
  },
  __singleLoaderHtml: `
  <div class="skeleton-article-container single-loader">
    <div class="skeleton skeleton-image"></div>
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-paragraph"></div>
    <div class="skeleton skeleton-button"></div>
  </div>
</div>`,
  __gridLoaderHtml: `
  <div class="skeleton-articles-container grid-loader">
    <div class="skeleton-article">
      <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
    <div class="skeleton-article">
      <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-button"></div>
    </div>
    <div class="skeleton-article">
      <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-button"></div>
    </div>
    <div class="skeleton-article">
      <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-button"></div>
    </div>
    <div class="skeleton-article">
      <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-button"></div>
    </div>
  </div>`,
};
