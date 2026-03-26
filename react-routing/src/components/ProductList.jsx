
import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/api';



const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ product: '', price: '', category: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setEditForm({ product: product.product, price: product.price, category: product.category });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = (id) => {
    setProducts(products.map((p) =>
      p.id === id ? { ...p, ...editForm, price: Number(editForm.price) } : p
    ));
    setEditId(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  return (
    <div>
      <h1>Product List</h1>
      {products.map((product) => (
        <div key={product.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          {editId === product.id ? (
            <>
              <input
                type="text"
                name="product"
                value={editForm.product}
                onChange={handleEditChange}
                placeholder="Product Name"
              />
              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Price"
                style={{ marginLeft: '8px' }}
              />
              <input
                type="text"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                placeholder="Category"
                style={{ marginLeft: '8px' }}
              />
              <button onClick={() => handleEditSave(product.id)} style={{ marginLeft: '8px' }}>Save</button>
              <button onClick={handleEditCancel} style={{ marginLeft: '4px' }}>Cancel</button>
            </>
          ) : (
            <>
              <h2>{product.product}</h2>
              <p>Price: ${product.price}</p>
              <p>Category: {product.category}</p>
              <button onClick={() => handleEdit(product)}>Edit</button>
              <button onClick={() => handleDelete(product.id)} style={{ marginLeft: '8px' }}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProductList

//products - entire array
//product - each object in the array
//data - entire JSON file - storing in a variable to access