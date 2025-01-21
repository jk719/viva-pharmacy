"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden 
                                     rounded-2xl bg-white p-6 shadow-xl 
                                     transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100
                             transition-colors duration-200"
                  >
                    <IoClose size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      {product.name}
                    </Dialog.Title>
                    
                    <p className="text-xl font-semibold text-primary mb-4">
                      ${product.price.toFixed(2)}
                    </p>
                    
                    <p className="text-gray-600 mb-6">
                      {product.description}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-3 px-6 
                               rounded-full hover:bg-primary/90 
                               transition-colors duration-200
                               flex items-center justify-center gap-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 