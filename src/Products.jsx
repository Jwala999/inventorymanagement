function Products({ setView, addToCart }) {
  const [products, setProducts] = React.useState([]);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = db.collection('categories').onSnapshot(
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      },
      (err) => {
        setError('Failed to fetch categories: ' + err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    let query = db.collection('products');
    if (selectedCategory) {
      query = query.where('category', '==', selectedCategory);
    }
    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setFilteredProducts(productsData);
      },
      (err) => {
        setError('Failed to fetch products: ' + err.message);
      }
    );
    return () => unsubscribe();
  }, [selectedCategory]);

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg p-4 sidebar">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <ul>
          <li
            className={`p-2 cursor-pointer rounded ${!selectedCategory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </li>
          {categories.map(category => (
            <li
              key={category.id}
              className={`p-2 cursor-pointer rounded ${selectedCategory === category.name ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Products</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-x-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 btn-custom"
                onClick={() => setView('dashboard')}
              >
                Back to Dashboard
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 btn-custom"
                onClick={() => setView('cart')}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-lg product-card cursor-pointer" onClick={() => handleViewDetails(product)}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4 product-image" />
                )}
                <h4 className="text-lg font-semibold">{product.name}</h4>
                <p className="text-gray-600">Category: {product.category}</p>
                <p className="text-gray-800 font-bold">₹{(product.price || 0).toFixed(2)}</p>
                <button
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 btn-custom"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the card click from triggering
                    addToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={handleCloseDetails}
                >
                  ✕
                </button>
              </div>
              {selectedProduct.imageUrl && (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg mb-4 product-image" />
              )}
              <p className="text-gray-600 mb-2"><span className="font-semibold">Category:</span> {selectedProduct.category}</p>
              <p className="text-gray-800 font-bold mb-2">₹{(selectedProduct.price || 0).toFixed(2)}</p>
              <p className="text-gray-600 mb-4"><span className="font-semibold">Description:</span> {selectedProduct.description || 'No description available.'}</p>
              <div className="flex space-x-4">
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 btn-custom"
                  onClick={() => {
                    addToCart(selectedProduct);
                    handleCloseDetails();
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 btn-custom"
                  onClick={handleCloseDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}