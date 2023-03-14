import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import testImg from '@/img/test.jpg'

const CloseButton = ({ onClick }) => (
  <button
    className="fixed top-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-lg border-2 border-white/20 hover:bg-slate-600"
    onClick={onClick}
  >X</button>
)

export default function HomePage({ products }) {
  const [showImage, setShowImage] = useState(false);
  const [showProduct, setShowProduct] = useState(0);
  const [productData, setProductData] = useState();

  useEffect(() => {
    if (!showProduct) return;

    const fetchProduct = async (pid) => {
      try {
        const result = await fetch(`/api/products/${pid}`);
        const json = await result.json();
        setProductData(json);
      } catch (err) {
        console.error(err);
      }
    }

    fetchProduct(showProduct);
  }, [showProduct])

  return (
    <>
      <div className="w-screen min-h-screen bg-slate-900 flex">
        <div className="w-fit mx-auto md:max-w-[1200px] text-white py-20 flex flex-col gap-6 [&>*]:mx-auto">
          <h1 className="text-4xl font-bold">CloudFlare - Next.js Deployment Example</h1>
          <Link href="https://github.com/designly1/cloudflare-nextjs" target="_blank">🔗 GitHub Repo</Link>
          <figure
            className="flex flex-col gap-2 [&>*]:mx-auto cursor-zoom-in"
            onClick={() => {
              setShowImage(oldVal => !oldVal);
            }}
          >
            <Image src={testImg.src} alt="Test Image" width={600} height={338} priority />
            <figcaption>An image rendered via Next/Image + CloudFlare Images (should be avif format)</figcaption>
          </figure>
          <hr />
          <h2 className="text-2xl font-bold">Some Products from getStaticProps()</h2>
          <h3>Click on a product to fetch from API route</h3>
          <div className="flex flex-col gap-6 md:flex-row md:flex-wrap">
            {products.map((product) => {
              return (
                <div
                  key={product.id}
                  className="w-full md:w-[200px] bg-blue-600 hover:bg-blue-800 p-4 cursor-pointer"
                  onClick={() => {
                    setShowProduct(product.id);
                  }}
                >
                  <h3 className="mb-4">{product.title}</h3>
                  <div>${product.price}</div>
                </div>
              )
            })}
          </div>
          <hr />

        </div>
      </div>
      {
        showImage
          ?
          <div className="fixed top-0 right-0 bottom-0 left-0">
            <CloseButton
              onClick={() => {
                setShowImage(oldVal => !oldVal);
              }}
            />
            <Image src={testImg.src} alt="Test Image" width={1920} height={1080} />
          </div>
          :
          <></>
      }
      {
        showProduct && productData
          ?
          <div className="fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex">
            <CloseButton
              onClick={() => {
                setShowProduct(0);
                setProductData(null);
              }}
            />
            <div className="m-auto">
              <img src={productData.thumbnail} alt={productData.title} />
            </div>
          </div>
          :
          <></>
      }
    </>
  )
}

export async function getStaticProps() {
  let products = [];
  try {
    const result = await fetch("https://dummyjson.com/products");
    const out = await result.json();
    products = out;
  } catch (err) {
    console.error(err);
  }

  return ({
    props: {
      products: products.products
    }
  })
}