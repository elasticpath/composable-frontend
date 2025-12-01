"use client";

import { JSX } from 'react';
import { EP_CURRENCY_CODE } from '../../lib/resolve-ep-currency-code';

interface IProductMultibuyOfferProps {
  product: any;
}

export function ProductMultibuyOffer({ product }: IProductMultibuyOfferProps): JSX.Element {
  const selectedCurrency = EP_CURRENCY_CODE
  const selectedLanguage = "en"
  let messages = []
  const keys = product.attributes.tiers && Object.keys(product.attributes.tiers);
  for (let i = 0; i < keys.length; i++) {
    const tierName = keys[i];
    if ("minimum_quantity" in product.attributes.tiers[tierName]) {
      const item = {
        quantity: product.attributes.tiers[tierName].minimum_quantity,
        price: product.attributes.tiers[tierName].price && product.attributes.tiers[tierName].price[selectedCurrency] && new Intl.NumberFormat(selectedLanguage, { style: 'currency', currency: selectedCurrency }).format((product.attributes.tiers[tierName].price[selectedCurrency].amount || 0) / 100)
      }
      messages.push(item)
    }
  }

  messages.sort((a, b) => a.quantity - b.quantity)
  let lastQuantity = 1
  let lastPrice = product.attributes.price && product.attributes.price[selectedCurrency] && new Intl.NumberFormat(selectedLanguage, { style: 'currency', currency: selectedCurrency }).format((product.attributes.price[selectedCurrency].amount || 0) / 100)
  let options = []

  messages && messages.forEach((alldata) => {
    options.push({
      quantity: lastQuantity + " - " + (alldata.quantity - 1),
      price: lastPrice
    });
    lastQuantity = alldata.quantity
    lastPrice = alldata.price
  });

  options.push({
    quantity: lastQuantity + " + ",
    price: lastPrice
  });

  return (
    options && (
      <div className="mt-2 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      QTY
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Price Per Item
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {options && options.map((tier: any) => {
                    return (
                      <tr key={tier.quantity}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-800 sm:pl-6">
                          {tier.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-800">{tier.price}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
