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