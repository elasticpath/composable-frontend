import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useBreakpointValue,
} from "@chakra-ui/react";
import Product from "./Product";
import { getProductById } from "../../services/products";
import {
  isChildProductResource,
  isSimpleProductResource,
} from "../../lib/product-helper";
import {
  retrieveBaseProps,
  retrieveChildProps,
  retrieveSimpleProps,
} from "../../lib/retrieve-product-props";
import { useEffect, useState } from "react";
import { IProduct } from "../../lib/types/product-types";
import { GetStaticPropsResult } from "next/types";

interface ProductModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModalContainer = ({
  productId,
  isOpen,
  onClose,
}: ProductModalProps) => {
  const modalSize = useBreakpointValue(
    {
      base: "full",
      md: "2xl",
    },
    {
      fallback: "2xl",
    }
  );
  const [productProps, setProductProps] =
    useState<GetStaticPropsResult<IProduct>>();

  const onSkuIdChange = (id: string) => {
    fetchProduct(id);
  };

  const fetchProduct = async (id: string) => {
    const product = await getProductById(id);
    const productData = product.data;
    const retrievedResults = isSimpleProductResource(productData)
      ? retrieveSimpleProps(product)
      : isChildProductResource(productData)
      ? await retrieveChildProps(product)
      : await retrieveBaseProps(product);
    setProductProps(retrievedResults);
  };

  useEffect(() => {
    isOpen && fetchProduct(productId);
  }, [productId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent maxW={{ base: "unset", md: "42rem", lg: "56rem" }} w="100%">
        <ModalCloseButton />
        <ModalBody>
          {productProps && "props" in productProps && (
            <Product
              {...productProps.props}
              onSkuIdChange={onSkuIdChange}
              onCloseModal={onClose}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
