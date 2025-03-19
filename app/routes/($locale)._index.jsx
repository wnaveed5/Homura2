"use client"

import { Link, useLoaderData } from "@remix-run/react"
import { Image, Money } from "@shopify/hydrogen"
import { useRef, useEffect } from "react"

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{ title: "Homura | Home" }]
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args)

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args)

  return { ...deferredData, ...criticalData }
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ])

  return {
    featuredCollection: collections.nodes[0],
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context }) {
  const recommendedProducts = context.storefront.query(RECOMMENDED_PRODUCTS_QUERY).catch((error) => {
    // Log query errors, but don't throw them so the page can still render
    console.error(error)
    return null
  })

  return {
    recommendedProducts,
  }
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData()
  const videoRef = useRef(null)

  useEffect(() => {
    // Ensure video plays automatically when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error)
      })
    }

    // Function to handle video source selection based on screen width
    const handleResize = () => {
      if (videoRef.current) {
        // Force reload the video when switching between sources
        const wasPlaying = !videoRef.current.paused
        if (wasPlaying) {
          videoRef.current.load()
          videoRef.current.play().catch((e) => console.error("Video play error:", e))
        }
      }
    }

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="home-container">
      {/* Full-screen background video with responsive sources */}
      <div className="video-container">
        <video ref={videoRef} autoPlay muted loop playsInline className="background-video">
          {/* Desktop video */}
          <source
            src="https://cdn.shopify.com/videos/c/o/v/215ea5cfe1f549ac889e15761d049bbd.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          {/* Mobile video */}
          <source
            src="https://cdn.shopify.com/videos/c/o/v/e5f25076076549c381cd1318ce12feab.mov"
            type="video/quicktime"
            media="(max-width: 767px)"
          />
          Your browser does not support the video tag.
        </video>

        {/* Overlay content */}
        <div className="content-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Homura</h1>
            <p className="hero-subtitle">Elevate your style</p>
            <div className="hero-cta">
              <Link to="/collections" className="cta-button">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured products section */}
      <section className="featured-products">
        <h2 className="section-title">Featured Products</h2>
        <div className="products-grid">
          <RecommendedProducts products={data.recommendedProducts} />
        </div>
      </section>
    </div>
  )
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <>
      <div className="recommended-products-grid">
        {products
          ? products.products.nodes.map((product) => (
              <Link key={product.id} className="recommended-product" to={`/products/${product.handle}`}>
                <Image data={product.images.nodes[0]} aspectRatio="1/1" sizes="(min-width: 45em) 20vw, 50vw" />
                <h4>{product.title}</h4>
                <small>
                  <Money data={product.priceRange.minVariantPrice} />
                </small>
              </Link>
            ))
          : null}
      </div>
    </>
  )
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: LanguageCode)
    @inContext(country: $country, language: LanguageCode) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

