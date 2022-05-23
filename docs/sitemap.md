## sitemap process

​

- we should create a cronjob that runs at night or at least once a day, that builds our sitemap from all threads on our database
- this process should create s3 files as output that we can serve on vercel, with that we will not colapse our database
- same for each customer, each customer will have their own sitemap files
- sitemap should not have more than 50k urls, so we should break it down into small sitemaps
  ​

### file examples

​

## linen.dev

​
main sitemap.xml
​

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://linen.dev/sitemap-threads-0.xml</loc></sitemap>
<sitemap><loc>https://linen.dev/sitemap-threads-1.xml</loc></sitemap>
</sitemapindex>
```

​

### linen.dev/sitemap-threads-0.xml

​

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://linen.dev/s/comunity/c/general/t/difference-between-math-floor-and-math-truncate</loc><lastmod>2022-04-22</lastmod></url>
<url><loc>https://linen.dev/s/comunity2/c/general/t/the-definitive-guide-to-form-based-website-authentication</loc><lastmod>2022-04-27</lastmod></url>
<url><loc>https://linen.dev/s/comunity3/c/random/t/unable-to-mock-httprequest-for-json-response-from-http-trigger-azure-function</loc><lastmod>2022-04-28</lastmod></url>
</urlset>
```

​

## customer.domain.io

​
main sitemap.xml for each customer
​

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://customer.domain.io/sitemap-threads-0.xml</loc></sitemap>
<sitemap><loc>https://customer.domain.io/sitemap-threads-1.xml</loc></sitemap>
</sitemapindex>
```

​

### customer.domain.io/sitemap-threads-0.xml

​

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://customer.domain.io/t/difference-between-math-floor-and-math-truncate</loc><lastmod>2022-04-22</lastmod></url>
<url><loc>https://customer.domain.io/t/the-definitive-guide-to-form-based-website-authentication</loc><lastmod>2022-04-27</lastmod></url>
<url><loc>https://customer.domain.io/t/unable-to-mock-httprequest-for-json-response-from-http-trigger-azure-function</loc><lastmod>2022-04-28</lastmod></url>
</urlset>
```
