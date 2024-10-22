export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-4xl font-bold">Welcome to VIVA Pharmacy & Wellness</h1>
        <p className="text-lg mt-2">Your trusted local pharmacy in Queens, NY</p>
      </header>

      {/* Featured Categories Section */}
      <section className="p-8">
        <h2 className="text-3xl font-bold mb-4">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category 1: Vitamins & Supplements */}
          <div className="bg-white p-6 shadow rounded">
            <h3 className="text-2xl font-bold text-gray-900">Vitamins & Supplements</h3>
            <p className="text-gray-700">Boost your health with our range of vitamins and supplements.</p>
          </div>
          {/* Category 2: Prescription Medications */}
          <div className="bg-white p-6 shadow rounded">
            <h3 className="text-2xl font-bold text-gray-900">Prescription Medications</h3>
            <p className="text-gray-700">Manage your prescriptions easily and get them delivered to your door.</p>
          </div>
          {/* Category 3: Wellness Products */}
          <div className="bg-white p-6 shadow rounded">
            <h3 className="text-2xl font-bold text-gray-900">Wellness Products</h3>
            <p className="text-gray-700">Explore our wellness products for a healthier lifestyle.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
