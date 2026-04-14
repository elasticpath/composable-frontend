import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';
import { initializeShopperClient } from '@/lib/epcc-shopper-client';
import {getByContextProduct, getProduct} from '@epcc-sdk/sdks-shopper';

import Footer from '../../../components/footer/Footer';

initializeShopperClient();

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ productId: string }> 
}) {
  const { productId } = await params;
  
  try {
    const response = await getByContextProduct({
      path: {
        product_id: productId
      },
      query: {
        include: ['main_image', 'component_products', 'files'] as const
      }
    });
    const product = response?.data;
    
    if (!product) {
      notFound();
    }
    
    return (
      <>
        <ProductDetail product={product} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}