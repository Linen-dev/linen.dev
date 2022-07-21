### our sitemap https://linen.dev/sitemap.xml

will return all free communities or premium without redirectDomain sitemaps as this example:

```xml
<sitemapindex ....>
   <sitemap>
      <loc>https://linen.dev/sitemap/973954867649470474/chunk.xml</loc>
   </sitemap>
   <sitemap>
      <loc>https://linen.dev/sitemap/sandrolinentest/chunk.xml</loc>
   </sitemap>
</sitemapindex>
```

### accessing https://linen.dev/sitemap/communityName/chunk.xml

will return all threads with more than 1 message from that specific community, for instance:

```xml
<urlset ....>
   <url>
      <loc>https://linen.dev/s/communityName/t/16/random-slug</loc>
   </url>
   <url>
      <loc>https://linen.dev/s/communityName/t/17/hello-world</loc>
   </url>
....
</urlset>
```

### accessing custom domain, as https://custom.domain.io/sitemap.xml

will return sitemap from channels with threads that has more than 1 message, example:

```xml
<sitemapindex ....>
   <sitemap>
      <loc>https://custom.domain.io/sitemap/c/general/chunk.xml</loc>
   </sitemap>
   <sitemap>
      <loc>https://custom.domain.io/sitemap/c/other/chunk.xml</loc>
   </sitemap>
</sitemapindex>
```

### accessing specific channel chunk of a custom domain, as https://custom.domain.io/sitemap/c/channel/chunk.xml

will return all threads with more than 1 message from that specific community channel based on their domain, plus channel pagination for example:

```xml
<urlset ...>
   <url>
      <loc>https://custom.domain.io/c/general/1</loc>
   </url>
   <url>
      <loc>https://custom.domain.io/c/general/2</loc>
   </url>
   <url>
      <loc>https://custom.domain.io/t/1123/random-slug</loc>
   </url>
   <url>
      <loc>https://custom.domain.io/t/32321/topic-random</loc>
   </url>
   ....
</urlset>
```

### notes

- s3 upload was remove from this implementation due lack of necessity. This implementation was bringing us trouble with the response size that nextjs allow us to return to the client, and the community is far from 50k threads
- same for the cron job that creates sitemaps, there is no need to persist the sitemap on s3
