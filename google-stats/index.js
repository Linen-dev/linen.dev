const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function crawl(site) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.google.com/search?q=site:' + site);
  await page.screenshot({ path: site + '.png' });
  const content = await page.content();
  const $ = cheerio.load(content);
  const resultStats = $('#result-stats').text();
  console.log(site, resultStats);
  await browser.close();
}

(async () => {
  await crawl('linen.dev');
  await crawl('archive.netsuiteprofessionals.com');
  await crawl('archive.ory.sh');
  await crawl('archive.pulumi.com');
  await crawl('archive.sst.dev');
  await crawl('community-chat.infracost.io');
  await crawl('community-chat.orchest.io');
  await crawl('community-chat.questdb.io');
  await crawl('community-chat.signoz.io');
  await crawl('community.cerbos.dev');
  await crawl('community.courier.com');
  await crawl('community.linenthreads.dev');
  await crawl('community.lunasec.io');
  await crawl('community.platformengineering.org');
  await crawl('community.ploomber.io');
  await crawl('community.screena.com');
  await crawl('community.supertokens.com');
  await crawl('discuss.datahubproject.io');
  await crawl('discuss.flyte.org');
  await crawl('forum.lakefs.io');
  await crawl('knowledge.lamina1.com');
  await crawl('linen-discord.kedro.org');
  await crawl('linen.authzed.com');
  await crawl('linen.futureofcoding.org');
  await crawl('linen.plasmo.com');
  await crawl('linen.prefect.io');
  await crawl('linen.questdb.io');
  await crawl('linen.tines.com');
  await crawl('osquery.fleetdm.com');
  await crawl('slack-chats.kotlinlang.org');
  await crawl('threads.netmaker.org');
  await crawl('web.open-source-silicon.dev');
  await crawl('www.thegrowthpros.io');
})();
