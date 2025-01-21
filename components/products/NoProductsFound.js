export default function NoProductsFound() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Products Found
      </h3>
      <p className="text-gray-600">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
} 