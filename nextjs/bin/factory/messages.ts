const messages = [
  `
Hey 👋
Quick note, I saw that there's a spelling error in the license dashboard UI:
&gt; 1 devices @ $1.00/device/month
&gt; Billed *anually* at $12.00/yr
&gt; Next payment on Apr 13, 2023
Should be *annually*.
`,
  `
<https://github.com/> - that should take care of that. Thanks for reporting it
`,
  `
Thank you both!
`,
  `
Check this out! <https://www.youtube.com/embed/Xsew54QshN8>
`,
  `
Having the *right amount of characters* on each line is key to the readability of your text.
`,
  `
Please check your logs.
LoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmetLoremIpsumDolorSitAmet
`,
  `
Hi, all. I want to know if I can install Linen offline?
`,
  `
Linen is ran using a bunch of containers. You can try 'docker save' to save the images required to transfer to the other offline machine. You can refer to any of the quickstart yml in docker/quickstart folder in the repo to get a sense of which images are required.
`,
  `
You can use \`linen docker quickstart --quickstart-compose-file local docker-compose file>\` where your local docker-compose-file points to saved docker images locally on your machine
`,
  `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sed fringilla ex, eu fermentum metus. Ut et ipsum at justo blandit dictum eget a justo. Cras eget porttitor lectus. Sed ac consequat massa. Proin euismod libero ut ligula dignissim, nec volutpat lorem viverra. Aliquam libero risus, pharetra eget porttitor sit amet, sodales pretium risus. Donec id vulputate quam. Aenean mattis tristique quam, nec auctor tellus mollis eget. Sed consequat ante at ligula egestas, at pellentesque libero interdum. Mauris vehicula mattis erat, vel feugiat erat rhoncus in. Vestibulum in tincidunt nibh, in hendrerit ipsum.

Nunc quam diam, ornare quis dictum ut, dapibus consectetur est. Vivamus sit amet felis tincidunt, facilisis arcu ac, dignissim tortor. Maecenas aliquam convallis ipsum, non semper ex sagittis at. Nullam finibus risus sit amet ipsum euismod, id condimentum purus condimentum. Integer vestibulum felis sapien, non eleifend orci tincidunt a. Nunc vulputate, ligula sit amet accumsan ultricies, nunc leo bibendum dolor, eget mollis nisl lorem in neque. Proin ultrices ligula et rhoncus fermentum. Ut tempor, ex sit amet tristique varius, purus est volutpat orci, id luctus nisi elit sit amet nisl. Duis ut metus eu felis sagittis volutpat id ultrices neque. Suspendisse vel convallis diam, sit amet venenatis est. Nullam eu congue odio.

Etiam posuere libero cursus, tristique dolor sed, vehicula tellus. Aliquam lacus nunc, accumsan sed velit ut, varius commodo neque. Vivamus convallis erat erat, quis ultricies lectus commodo non. Vivamus in mollis elit, ut venenatis risus. Duis maximus lobortis lorem vitae blandit. Nunc vehicula magna purus, eu tincidunt purus euismod et. Vestibulum quis imperdiet ante. Curabitur ultrices massa massa, ut consectetur justo scelerisque et. Sed ut molestie sapien. Quisque hendrerit odio sit amet ante pellentesque cursus. Fusce laoreet erat pharetra, hendrerit nibh sagittis, accumsan tortor. Sed eu efficitur dui, vitae viverra leo. Aliquam arcu diam, rutrum sit amet accumsan vel, ultricies eu nibh. Praesent vulputate odio ut ligula semper finibus. Integer consequat dapibus euismod.

Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus vel lorem id tortor pretium malesuada. Maecenas interdum, orci sit amet hendrerit ultricies, arcu mauris mattis quam, id gravida lorem libero sed sapien. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum et lorem sit amet elit malesuada finibus ut ut nunc. Suspendisse faucibus suscipit justo quis egestas. Donec eu ligula non purus pulvinar interdum. Fusce consequat tortor in sapien pulvinar, et placerat lorem viverra. Vivamus tellus nulla, elementum at porttitor quis, faucibus quis nunc.

Vivamus sit amet dictum quam, a ultricies justo. Etiam dolor erat, lacinia vel neque non, pretium auctor turpis. Vestibulum vel risus sed massa consectetur luctus. Maecenas cursus lectus risus, vel laoreet lorem lacinia ac. Proin elementum dictum quam, a vestibulum sapien viverra mollis. Nunc posuere laoreet ante, sit amet hendrerit enim porttitor ac. Suspendisse velit justo, lacinia ut eros nec, volutpat commodo est. Ut interdum diam a eros ultrices, ut dignissim leo interdum. Fusce accumsan sed enim quis tempus. Aenean a sodales magna. Sed dui lectus, tincidunt a neque in, egestas mollis nibh. Mauris et bibendum metus, eget ornare ex. Ut libero tellus, feugiat quis mi ac, cursus suscipit enim.
`,
].map((message) => message.trim());

export default messages;
