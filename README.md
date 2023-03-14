Host Your Next.js Site on CloudFlare Pages With Next/Image Support For Free
------------------

Cloudflare Pages is a cloud-based platform that enables developers to build, deploy, and scale modern web applications and websites. It is a serverless platform, meaning that it allows developers to build and deploy applications without worrying about managing servers or infrastructure.

With Cloudflare Pages, developers can connect their code repositories and build their applications using their preferred tools and languages. The platform supports a wide range of static site generators, frameworks, and programming languages, including React, Next.js, Gatsby, Vue.js, and more.

Once the application is built, Cloudflare Pages automatically builds and deploys the application to a global network of servers, ensuring fast and reliable access for users around the world. The platform also provides built-in performance optimizations, including caching, automatic minification, and image optimization, to ensure that applications load quickly and efficiently.

In addition to its core functionality, Cloudflare Pages integrates with other Cloudflare services, including Cloudflare Workers, which enables developers to create powerful serverless applications that can be run on the edge of the network. Overall, Cloudflare Pages provides developers with a powerful, flexible, and scalable platform for building and deploying modern web applications.

This tutorial will focus on deploying a Next.js website to CloudFlare pages complete with Next/Image support via a custom image loader. This tutorial also assumes you have the following things:

1. A ready-to-deploy Next.js project hosted on GitHub
2. A CloudFlare account
3. DNS hosted on CloudFlare

It's actually not absolutely required to host your DNS on CloudFlare, but if you're going to host your site there, you should strongly consider using their other features like scrape protection, DDOS protection and automatic edge server caching of resources. It's all offered completely free with generous quotas. See [this page](https://developers.cloudflare.com/workers/platform/limits/) for more information on CloudFlare's service limits.

## Caveats

Now CloudFlare may have free tier limits far greater than that of Vercel's, but remember, the Vercel platform is *made* for Next.js. It's a one hundred percent turn-key solution. You can deploy a site on Vercel in literally a couple minutes with `create-next-app` and GitHub.

Things aren't so simple when it comes to CloudFlare Pages, though. It will require some additional configuration and the enabling of experimental, not fully tested features. That said, I think the rewards of going through these extra steps is well worth the effort, because CloudFlare is a great environment to host any site, from a simple static web page, to a full-fledged progressive web app.

## Key Differences Between CloudFlare and Vercel

There are two key services that Vercel provides Next.js sites automatically. The first is automatic image optimization via the Next/Image package. The other are the automatic creation of serverless functions when using server-dependent functions such as API routes and `getServerSideProps()`.

CloudFlare will do these things for you automatically, too, but require additional configuration. And, unfortunately, as of yet I am unable to get `getServerSideProps()` to function properly with experimental-edge enabled globally in `next.config.js`. There are still too many bugs. However, you can still use API routes for dynamic content as well as `getStaticProps()` for less frequently updated dynamic content. If anyone is successfully using CloudFlare Pages with all features working together, please leave a comment!

## Preparing Your Project for Deployment

Ok, let's get on with it! Assuming you already have a Next.js project, the firsts thing we need to do is create our custom image loader. I've opted to create the one in this tutorial in the root directory and called it `cfImageLoader.js`.

```js
// cfImageLoader.js
export default function cfImageLoader({ src, width, quality }) {
    const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto']
    return `https://cfnext.designly.biz/cdn-cgi/image/${params.join(',')}/${src}`
}
```

Pretty basic. It simply maps the received parameters from Next/Image to an API endpoint. The domain name of the URL is the custom domain I assigned to the [demo project](https://cfnext.designly.biz) I created for this tutorial. The `cdn-cgi` route is automatically available for any deployed CloudFlare Pages site! 😁

Next, we need to tell Next.js to use this as the default loader for all `<Image>` components:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      reactStrictMode: true,
    }
  }

  // Production config
  return {
    swcMinify: true,
    images: {
      loader: 'custom',
      loaderFile: './cfImageLoader.js'
    },
  }
}
```

With this set, image optimization should work once the site is deployed. You can verify it's working by inspecting an image on the deployed site and downloading it. If it downloads as an `.avif` file, it's working. By default CloudFlare Images auto-detects the best image format based on browser capabilities to maximize the file size reduction, but you can override this by appending `format=webp` to the URL parameters, for example.

That's takes care of images. Next, we're going to set up an API route to fetch some data from a fake products API. This is a little different than what you're used to using the Node Express server. API routes on CloudFlare require the use of Next's edge runtime and CloudFlare will automatically create a web worker for each of these routes. So if you're familiar with CloudFlare workers, you'll be right at home!

```js
// @/pages/api/product/index.js
// Next.js Edge API Routes: https://nextjs.org/docs/api-routes/edge-api-routes

// Tell Next.js to use the edge runtime
export const config = {
    runtime: 'edge',
}

export default async function handler(req) { // notice we don't receive a 'res' prop

    /**
     * CloudFlare does not yet support path to query param redirects,
     * so we must use traditional query params
     */
    const { searchParams } = new URL(req.url)
    const pid = searchParams.get('pid');
    const url = `https://dummyjson.com/products/${pid}`;

    try {
        const result = await fetch(url);
        const json = await result.json();

        /**
         * Instead of the 'res' ojbect from express, we
         * instantiate a new fetch API Response object
         */
        return new Response(
            JSON.stringify(json),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    } catch (err) {
        console.error(err);
        return new Response(
            null,
            {
                status: 500,
                statusText: 'Error fetching product data'
            }
        )
    }
}
```

That should be it for the changes you'll need to make to your project. As I said before, unfortunately, `getServerSideProps()` does not work currently (at least I am unable to get it to work with custom image loader enabled as well). You can, however, still use `getStaticProps()`.

Lastly, you'll want to commit your changes to GitHub.

## Deploying Your Site to CloudFlare

Assuming you are already logged into the [CloudFlare Dashboard](https://dash.cloudflare.com), you'll want to click `Pages` on the left sidebar, then click the `Create a project` button and select `Connect to Git`:

![Create a project](https://cdn.designly.biz/blog_files/host-your-next-js-site-on-cloudflare-pages-with-next-image-support/image1.jpg)

On the next screen, choose a name for your project, then select `Next.js` for the framework, and then set an environment variable `NODE_VERSION=16.17.1`, which is the current LTS version of node at the time of writing this article. Finally, click `Save and deploy`.

![Create a project](https://cdn.designly.biz/blog_files/host-your-next-js-site-on-cloudflare-pages-with-next-image-support/image2.jpg)

The initial build will take some time, but you don't have to wait for it to complete. You can just click `continue to deployment` to move on because we want to go ahead and assign a custom domain name for our site.

From the details page of our deployment, click the `Custom domains` tab and then click `Set up a custom domain`:

![Set up a custom domain](https://cdn.designly.biz/blog_files/host-your-next-js-site-on-cloudflare-pages-with-next-image-support/image3.jpg)

Enter in your desired domain name and then click continue. If you're DNS is hosted through CloudFlare (recommended), then it will automatically create a new CNAME record for that points to the assigned domain for the production branch of your deployment. If your DNS is not hosted through CloudFlare, then you're screwed... no j/k, but you'll need to manually create a CNAME record with your provider. CloudFlare will periodically check the validity of the DNS record and notify you when it's ready. The whole process typically takes less than a minute.

![Create a project](https://cdn.designly.biz/blog_files/host-your-next-js-site-on-cloudflare-pages-with-next-image-support/image4.jpg)

## Wrapping it Up

Well that just about does 'er for this one. I hope you, as have I find that it's worth the extra effort to use CloudFlare over Vercel (unless you want to give Vercel lots of money). You can just do so much more with CloudFlare, but it requires some additional technical know-how. CloudFlare Workers is also a fantastic tool and using the edge API for middleware calls will greatly speed up dynamic fetching of site content. CloudFlare is among the top services for serverless functions in regards to cost vs benefit as well as function response time.

If you want to check out the demo project I created:

1. [Demo Project Repo](https://github.com/designly1/cloudflare-nextjs)
2. [Demo Project Site](https://cfnext.designly.biz)

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://designly.biz/blog). Also, please leave your comments! I love to hear thoughts from my readers.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).

## Further Reading

1. [CloudFlare Images Docs](https://developers.cloudflare.com/images/cloudflare-images/api-request/)
2. [MDN Fetch API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Response)
3. [CloudFlare next-on-pages Blog Post | 10/24/22](https://blog.cloudflare.com/next-on-pages/)
4. [Next.js Edge API Docs](https://nextjs.org/docs/api-routes/edge-api-routes)
5. [Which Is Better: Vercel or Cloudflare (Pages + Workers) For Jamstack Deployment? | EBO Digital](https://webo.digital/blog/which-is-better-vercel-or-cloudflare/)
6. [Deploy a Next.js site | CloudFlare Docs](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)