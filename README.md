# Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Reactivity](#Reactivity)
- [Project Structure](#project-structure)
  - [Initialization](#Initialization)
  - [Main Execution](#main-execution)
  - [Layouts](#layouts)
    - [Base](#base)
    - [ArticleGrid](#article-grid)
    - [Article](#article)
  - [Loaders](#loaders)

# Introduction

This repo aims to create a client-side application for consumption of article content from Hygraph CMS.
Hygraph is backed by GraphQL and utilizes strategies outlined in their [docs](https://graphql.org/learn/), These docs assume a basic familiarity with GraphQL.

This project also leverages [Vite](https://vite.dev/guide/), a tool to run a dev server and build for production.

# Getting Started

To get started with this project, follow these steps:

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. **Install dependencies:**

Make sure you have [Node.js](https://nodejs.org/) installed. Then, run the following command to install the necessary dependencies:

```bash
npm install
```

3. **Run the development server:**

After the dependencies are installed, you can start the development server with:

```bash
npm run dev
```

4. **Build for production:**

To create a production build, use the following command:

```bash
npm run build
```

Now you are ready to start developing and consuming article content from Hygraph CMS!

# Reactivity

Before diving in, it is important to note how each component (articles, loaders, etc) functions under the hood. Each component is wrapped in a `reactive()` function, provided by the [lightweight-reactivity](https://github.com/vit-the-jedi/lightweight-reactivity) dependency.

The `reactive()` function allows for updates to be triggered simply by updating an object or classes property.

Example:

```
import { reactive } from 'path-to-lightweight-reactivity-dependency';

const obj = {
count: 0,
message: 'Hello',
__effects = {
  count: {
    log: function() {
      console.log(`Count changed to: ${reactiveObj.count}`)
      },
    },
  };
};
const reactiveObj = reactive(obj);

// Modifying the property triggers effects
reactiveObj.count = 1; // Logs: "Count changed to: 1"

```

Throughout these docs, you will see that all updates are triggered by updating a property on an article or loader. Read the [docs](https://github.com/vit-the-jedi/lightweight-reactivity/blob/main/README.md) for a more in depth explanation.

# Project Stucture

## Initilization

`init.js` creates and exposes two functions to initialize both a single article, and article grid instance. We assign these functions to the window so they can be called from Impressure.

Since Impressure has reliable ways to view routes/current pages, it makes more sense to delegate the article creation logic to Impressure, rather than run this code inside article creation.

```
//window functions (init.js)

window.initializeGrid = initializeGrid;
window.initializeSingle = initializeSingle;

//Impressure usage (Impressure settings tab/code block)

if (showArticleGrid){
  window.initializeGrid();
}else {
  window.initializeSingle();
}
```

## Main Execution

`main.js` is responsible for creating and exporting the instances of, ArticleGrid, and articleLoader, which are imported into init.js.

main.js also exports a few helper functions needed at different points in the lifecycle.

## Layouts

the `/layouts` directory houses the classess needed to create an article layout. Currently there are 2 layouts, a single article and an article grid. New layouts should be created in this directory.

The structure of layouts is simple, `Base` holds shared functionality, `Article` is responsible for single article views, and `ArticleGrid` is responsible for multiple article view in a grid format.

### Base

Each layout extends the Base layout class, which holds shared functionality that all article layouts will rely on. All methods and data on the Base layout are automatically included in extended layouts.

Base is responsible for analytics tracking, created in the class constructor

```
export class ArticleController {
  constructor(config) {
    this.analytics = {
      events: {
        view: (title) => {
          window.dataLayer.push({
            event: "articleView",
            articleTitle: title,
          });
        },
      },
      init: () => {
        window.dataLayer = window.dataLayer || [];
      },
    };
  }
}
// when a user clicks an article to view, you can fire the associated event

link.addEventListener("click", (event) => {
  event.preventDefault();
  //fire the analytics event with relevant data
  this.analytics.events.view(this.article.title);
});
```

The `Base` layout also contains a method `fetchHandler`, which handles all data fetching. This provides a single surface area to get data and detect data fetching related errors.

`fetchHandler` returns a JSON response with the data, if an error occurs, the method will throw a new Error with a relevant message.

```
//simply pass your GraphQL query and variables to the function to fetch appropriate data

//reactively update a layouts data using fetchHandler

this.article = await this.fetchHandler(query, variables);
```

### Article

`Article` represents a single article view, which contains all of the data relevant to one singular article. An `Article` instance may also contain a `relatedArticles` field (depending on data from CMS), which will update the `ArticleGrid` instance to display those as a grid.

`Article` contains 3 reactive properties that drive the article creation. We will cover the most important one.

Generally, all reactive updates stem first from the `urlSlug` property.

1. `this.urlSlug` (reactive)

Below are 2 sceneraios

User clicks an article in ArticleGrid to view

```
articleCard.addEventListener("click", function(){
  const parentElement = ev.target.closest(".article-card");

  //once the articleSingle.urlSlug property is set with a new value, the new article is immediately fetched and articleSingle.article and articleSingle.relatedArticles are set with response data and the article is built

  articleSingle.urlSlug = this.articles.find(
    (article) => article.id === parentElement.id
  ).urlSlug;
})
```

OR User naviagtes directly to a link ex: www.domain.com/article/article-url-slug

```
// in this case, we check to see if a direct url is navigated to, currently this is done in Impressure on initilization of the survey using the window.initializeSingle function

// use the getSlugFromUrl() helper function to get and set the slug, immediately propegating data fetching and article creation.
const initializeSingle = function () {
  articleSingle.urlSlug = getSlugFromUrl();
};

```

### ArticleGrid

`ArticleGrid` handles all multiple article views in grid format.

There are 2 scenarios where this layout is used, and the usage differes slightly from `ArticleSingle`

`ArticleGrid` relies on a `fetch` flag to decide whether data needs to be fetched before proceeding.

When user navigates to www.domain.com/articles

```
// in this case, we check to see if /articles is navigated to, currently this is done in Impressure on initilization of the survey using the window.initializeGrid function

const initializeGrid = function () {
  articleGrid.fetch = true;
};
```

## Loaders

the `/loaders` directory houses any loading UI components. Currently there are 2 loaders, a grid and a single article loader. These loaders are skeleton UI's to represent the content that we are fetching from the CMS during load times.

To create a new loader, create a new [non-reactive](https://github.com/vit-the-jedi/lightweight-reactivity/blob/main/README.md#notes) field on the `articleLoader` object in `loader.js`, with a template string containing the HTML.

```

__newLoaderLayout: `

<div class='new-loader'>
  <span>I'm Loading!</span>
</div>`

```

A simple use case is as follows.

```
// do some logic to choose the appropriate article layout to load

let articleLayout;

if (window.location.pathname.split("/")[1] === "articles") {
articleLayout = "grid";
} else {
articleLayout = "single";
}

//...other init logic

//trigger reactive updates when loader layout is changed/set
loader.layout = articleLayout;
```
