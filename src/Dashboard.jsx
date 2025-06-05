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

  React.useEffect(() => {
    console.log("User object:", user); // Debug: Log user object
    if (!db) {
      setError('Firestore is not initialized.');
      console.error("Firestore is not initialized.");
      return;
    }
    if (!user || !user.uid) {
      setError('User is not authenticated.');
      console.error("User is not authenticated or user.uid is missing.");
      return;
    }
    db.collection('users').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          const profileData = doc.data();
          console.log("User profile data:", profileData); // Debug: Log user profile
          setUserProfile(profileData);
        } else {
          setError('User profile not found.');
          console.error("User profile not found in Firestore.");
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
      console.error("Firestore is not initialized.");
      return;
    }
    const unsubscribe = db.collection('categories').onSnapshot(
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Categories fetched:", categoriesData); // Debug: Log categories
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
      console.error("Firestore is not initialized.");
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
        console.log("Products fetched:", productsData); // Debug: Log products
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

  if (!user) {
    console.log("User is undefined, showing loading state."); // Debug: Log user state
    return (
      <div className="flex justify-center items-center h-screen">
        <p>User not authenticated. Redirecting...</p>
      </div>
    );
  }

  if (!userProfile) {
    console.log("UserProfile is undefined, showing loading state."); // Debug: Log userProfile state
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg p-4 sidebar flex flex-col justify-between">
        <div>
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
                }}
              >
                Logout
              </button>
              <button
                className="flex items-center gap-2 w-full text-left p-2 text-red-600 hover:bg-gray-200 hover:text-red-700"
                onClick={() => {
                  handleDeleteAccount();
                  setShowDropdown(false);
                }}
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <div className="flex items-center space-x-3">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 btn-custom"
              onClick={() => setView('products')}
            >
              View Products
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 btn-custom"
              onClick={() => setView('categories')}
            >
              Manage Categories
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 btn-custom"
              onClick={() => setView('cart')}
            >
              View Cart
            </button>
          </div>
        </div>
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
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <select
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Price (INR)"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <textarea
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Product Description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows="4"
            />
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 border rounded-lg"
              onChange={(e) => setProductImage(e.target.files[0])}
            />
            {productImage && (
              <div className="mt-2">
                <img src={URL.createObjectURL(productImage)} alt="Preview" className="w-32 h-32 object-cover rounded-lg product-image" />
              </div>
            )}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 btn-custom"
              onClick={handleAddProduct}
            >
              Add Product
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Product List</h3>
          {products.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <ul className="space-y-2">
              {products.map(product => (
                <li key={product.id} className="flex justify-between items-center p-3 border rounded-lg product-card">
                  <div className="flex items-center space-x-4">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg product-image" />
                    )}
                    <span>{product.name} (Category: {product.category})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>₹{(product.price || 0).toFixed(2)}</span>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 btn-custom"
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