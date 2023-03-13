import React from 'react'
import Image from 'next/image'
import testImg from '@/img/test.jpg'

export default function HomePage() {
  return (
    <div className="outer">
      <div className="inner">
        <h1>CloudFlare - Next.js Deployment Example</h1>
        <Image src={testImg.src} alt="Test Image" width={600} height={338} />
      </div>
    </div>
  )
}