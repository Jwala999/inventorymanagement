function Dashboard({ user, setView }) {
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [productName, setProductName] = React.useState('');
  const [productCategory, setProductCategory] = React.useState('');
  const [productPrice, setProductPrice] = React.useState('');
  const [productDescription, setProductDescription] = React.useState('');
  const [productImage, setProductImage] = React.useState(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [userProfile, setUserProfile] = React.useState(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false); // State for sidebar toggle on mobile

  React.useEffect(() => {
    if (!db) {
      setError('Firestore is not initialized.');
      return;
    }
    if (!user || !user.uid) {
      setError('User is not authenticated.');
      return;
    }
    db.collection('users').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          setUserProfile(doc.data());
        } else {
          setError('User profile not found.');
        }
      })
      .catch(err => {
        console.error("Error fetching user profile:", err);
        setError('Failed to fetch user profile: ' + err.message);
      });
  }, [user]);

  React.useEffect(() => {
    if (!db) {
      setError('Firestore is not initialized.');
      return;
    }
    const unsubscribe = db.collection('categories').onSnapshot(
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      },
      (err) => {
        console.error("Error fetching categories:", err);
        setError('Failed to fetch categories: ' + err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!db) {
      setError('Firestore is not initialized.');
      return;
    }
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
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError('Failed to fetch products: ' + err.message);
      }
    );
    return () => unsubscribe();
  }, [selectedCategory]);

  const handleAddProduct = async () => {
    if (!productName.trim() || !productCategory.trim() || !productPrice) {
      setError('All fields except description are required.');
      return;
    }
    try {
      let imageUrl = '';
      if (productImage) {
        imageUrl = URL.createObjectURL(productImage);
      }
      await db.collection('products').add({
        name: productName,
        category: productCategory,
        price: parseFloat(productPrice),
        description: productDescription || '',
        imageUrl: imageUrl || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setSuccess('Product added successfully!');
      setProductName('');
      setProductCategory('');
      setProductPrice('');
      setProductDescription('');
      setProductImage(null);
      setError('');
    } catch (err) {
      console.error("Error adding product:", err);
      setError('Failed to add product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await db.collection('products').doc(productId).delete();
      setSuccess('Product deleted successfully!');
    } catch (err) {
      console.error("Error deleting product:", err);
      setError('Failed to delete product: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setView('login');
    } catch (err) {
      console.error("Error logging out:", err);
      setError('Failed to log out: ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmation) return;

    try {
      await db.collection('users').doc(user.uid).delete();
      await user.delete();
      setSuccess('Account deleted successfully.');
      setView('login');
    } catch (err) {
      console.error("Error deleting account:", err);
      setError('Failed to delete account: ' + err.message);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Hidden on mobile, toggled with hamburger menu */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg p-4 sidebar transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}>
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <ul>
            <li
              className={`p-2 cursor-pointer rounded ${!selectedCategory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => {
                setSelectedCategory('');
                setShowSidebar(false); // Close sidebar on mobile after selection
              }}
            >
              All Categories
            </li>
            {categories.map(category => (
              <li
                key={category.id}
                className={`p-2 cursor-pointer rounded ${selectedCategory === category.name ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setShowSidebar(false); // Close sidebar on mobile after selection
                }}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
        {/* User Profile at Bottom-Left */}
        <div className="user-dropdown mt-4">
          <div
            className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userProfile.photoUrl && (
              <img
                src={userProfile.photoUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover profile-photo"
              />
            )}
            <span className="text-sm font-medium text-gray-800">
              {userProfile.firstName} {userProfile.lastName}
            </span>
          </div>
          {showDropdown && (
            <div className="dropdown-menu mt-2">
              <button
                className="flex items-center gap-2 w-full text-left p-2 hover:bg-gray-200"
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                  setShowSidebar(false);
                }}
              >
                Logout
              </button>
              <button
                className="flex items-center gap-2 w-full text-left p-2 text-red-600 hover:bg-gray-200 hover:text-red-700"
                onClick={() => {
                  handleDeleteAccount();
                  setShowDropdown(false);
                  setShowSidebar(false);
                }}
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Header with Hamburger Menu and Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu for Mobile */}
            <button
              className="text-gray-800 md:hidden focus:outline-none"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h2>
          </div>
          {/* Navigation Buttons - Stack vertically on mobile */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <button
              className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 btn-custom"
              onClick={() => setView('products')}
            >
              View Products
            </button>
            <button
              className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 btn-custom"
              onClick={() => setView('categories')}
            >
              Manage Categories
            </button>
            <button
              className="w-full md:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 btn-custom"
              onClick={() => setView('cart')}
            >
              View Cart
            </button>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}

        {/* Add Product Form */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Add New Product</h3>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <select
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Price (INR)"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <textarea
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Product Description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows="3"
            />
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 border rounded-lg text-sm md:text-base"
              onChange={(e) => setProductImage(e.target.files[0])}
            />
            {productImage && (
              <div className="mt-2">
                <img src={URL.createObjectURL(productImage)} alt="Preview" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg product-image" />
              </div>
            )}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 btn-custom text-sm md:text-base"
              onClick={handleAddProduct}
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Product List</h3>
          {products.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">No products found.</p>
          ) : (
            <ul className="space-y-2">
              {products.map(product => (
                <li key={product.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg product-card space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg product-image" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-800 text-sm md:text-base">{product.name}</span>
                      <p className="text-xs md:text-sm text-gray-500">Category: {product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-bold text-sm md:text-base">₹{(product.price || 0).toFixed(2)}</span>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 btn-custom text-xs md:text-sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}