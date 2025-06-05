function Categories({ setView }) {
  const [categories, setCategories] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }
    try {
      await db.collection('categories').add({
        name: categoryName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setSuccess('Category added successfully!');
      setCategoryName('');
      setError('');
    } catch (err) {
      setError('Failed to add category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      // Check if any products use this category
      const productsSnapshot = await db.collection('products')
        .where('category', '==', categories.find(cat => cat.id === categoryId).name)
        .get();
      if (!productsSnapshot.empty) {
        setError('Cannot delete category. It is used by products.');
        return;
      }
      await db.collection('categories').doc(categoryId).delete();
      setSuccess('Category deleted successfully!');
    } catch (err) {
      console.error("Error deleting category:", err);
      setError('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Categories</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => setView('dashboard')}
        >
          Back to Dashboard
        </button>
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
        <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            onClick={handleAddCategory}
          >
            Add Category
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Category List</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span>{category.name}</span>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}