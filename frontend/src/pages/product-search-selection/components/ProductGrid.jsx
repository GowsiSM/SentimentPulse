// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/ProductGrid.jsx
import React from 'react';
import ProductCard from './ProductCard';
import Icon from '../../../components/AppIcon';

const ProductGrid = ({ 
  products, 
  selectedProducts, 
  onProductSelect, 
  onProductAnalyze, 
  showBulkSelect, 
  isLoading, 
  viewMode = 'grid',
  className = "" 
}) => {

  if (isLoading) {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index}
            className={`bg-card border border-border rounded-lg overflow-hidden animate-pulse ${
              viewMode === 'grid' ? 'aspect-[3/4]' : 'h-32'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="aspect-square bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </>
            ) : (
              <div className="p-4 flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (products?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon name="Search" size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search terms or filters to find the products you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    } gap-6 ${className}`}>
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProducts?.includes(product.id)}
          onSelect={onProductSelect}
          onAnalyze={onProductAnalyze}
          showBulkSelect={showBulkSelect}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default ProductGrid;