import {getAllProducts, getByContextAllProducts} from '@epcc-sdk/sdks-shopper';
import { initializeShopperClient } from '@/lib/epcc-shopper-client';

import Footer from '../../components/footer/Footer';
import ProductCard from '../components/ProductCard';
import styles from './products.module.css';

initializeShopperClient();

export default async function ProductsPage() {
  try {
    const response = await getByContextAllProducts({
      query: {
        include: ['main_image'] as const,
        "page[limit]": BigInt(20),
      }
    });
    
    const products = response?.data?.data || [];
    const included = response.data?.included || {};
    const mainImages = included.main_images || [];

    return (
      <>

        <main className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Our Products</h1>
            <p className={styles.subtitle}>Discover our wide range of quality products</p>
          </div>

          <div className={styles.contentWrapper}>
            {/* Mock Filters Sidebar */}
            <aside className={styles.filtersSidebar}>
              <h2 className={styles.filtersTitle}>Filters</h2>
              
              {/* Category Filter */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterHeading}>Categories</h3>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Electronics</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Clothing</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Home & Garden</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Sports & Outdoors</span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterHeading}>Price Range</h3>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Under $25</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>$25 - $50</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>$50 - $100</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Over $100</span>
                </label>
              </div>

              {/* Brand Filter */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterHeading}>Brands</h3>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Brand A</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Brand B</span>
                </label>
                <label className={styles.filterOption}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Brand C</span>
                </label>
              </div>

              <button className={styles.clearButton}>Clear All Filters</button>
            </aside>

            {/* Products Grid */}
            <div className={styles.productsSection}>
              {/* Sort Options */}
              <div className={styles.sortBar}>
                <div className={styles.resultsCount}>
                  Showing {products.length} products
                </div>
                <div className={styles.sortOptions}>
                  <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                  <select id="sort" className={styles.sortSelect}>
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className={styles.productsGrid}>
                {products.map((product) => {
                  const mainImageId = product.relationships?.main_image?.data?.id;
                  const mainImage = mainImages.find((img: any) => img.id === mainImageId);
                  const imageUrl = mainImage?.link?.href || '/placeholder-product.jpg';
                  
                  return (
                    <ProductCard
                      key={product.id}
                      href={`/products/${product.id}`}
                      image={imageUrl}
                      title={product.attributes?.name!}
                      showPlaceholder={false}
                    />
                  );
                })}
              </div>

              {/* Pagination (Mock) */}
              <div className={styles.pagination}>
                <button className={styles.pageButton} disabled>Previous</button>
                <button className={`${styles.pageNumber} ${styles.active}`}>1</button>
                <button className={styles.pageNumber}>2</button>
                <button className={styles.pageNumber}>3</button>
                <button className={styles.pageNumber}>4</button>
                <button className={styles.pageNumber}>5</button>
                <button className={styles.pageButton}>Next</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <>

        <main className={styles.container}>
          <div className={styles.errorMessage}>
            <h1>Error loading products</h1>
            <p>Sorry, we couldn't load the products. Please try again later.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}