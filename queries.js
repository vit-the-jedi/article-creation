"use strict";
const singleArticleQuery = {
  query: `query getArticleWithRelated($stage: Stage!, $targetedLocation: [Locations!], $domain: Domain!, $urlSlug: String, $vertical: String, $subvertical: String, $article: ArticleTypes!) {
    article: articles(
      where: {
        vertical: $vertical, 
        subvertical: $subvertical, 
        articleType: $article, 
        urlSlug: $urlSlug, 
        domain: $domain,
      }
      stage: $stage
      orderBy: updatedAt_DESC
    ) {
      id
      urlSlug
      title
      secondaryImage {
        url
      }
      articleType
      readTime
      publishedAt
      excerpt
      date
      coverImage {
        url
      }
      contentTag(first: 5) {
        id
        tagValue
      }
      content {
        html
      }
      locationTags
    }
    relatedArticles: articles(
      where: {
              OR: [{ locationTags_contains_some: $targetedLocation }, { locationTags: [] }]
        vertical: $vertical, subvertical: $subvertical, articleType: article, domain: $domain, NOT: {urlSlug: $urlSlug}}
      first: 100
      stage: $stage
    ) {
      id
      urlSlug
      title
      readTime
      publishedAt
      excerpt
      date
      coverImage {
        url
      }
      locationTags
    }
  }`,
  variables: {
    stage: "DRAFT",
    vertical: "insurance",
    subvertical: "auto-insurance",
    article: "article",
    domain: "freeInsuranceQuotesUs",
    urlSlug: this.urlSlug,
  },
};
