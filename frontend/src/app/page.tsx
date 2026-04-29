export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h2 className="text-4xl font-extrabold text-gray-900">Welcome to CloudShop</h2>
        <p className="mt-4 text-xl text-gray-500">Your cloud-native e-commerce destination</p>
      </section>

      <section>
        <h3 className="text-2xl font-bold mb-6">Featured Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Static placeholders for now, would fetch from product-service */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h4 className="text-lg font-semibold">Awesome Product {i}</h4>
              <p className="text-gray-500 mb-4">$99.99</p>
              <button className="mt-auto w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
