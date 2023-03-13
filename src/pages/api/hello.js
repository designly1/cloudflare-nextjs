// @/pages/api/hello.js
// Next.js Edge API Routes: https://nextjs.org/docs/api-routes/edge-api-routes

export const config = {
  runtime: 'edge',
}

export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
}
