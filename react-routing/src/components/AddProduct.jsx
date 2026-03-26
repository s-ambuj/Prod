import React, {useState} from 'react'
import { addProduct } from '../api/api';

const AddProduct = () => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState(0)
    const [category, setCategory] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newProduct = {
            product: name,
            price: Number(price),
            category: category
        };
        try {
            await addProduct(newProduct);
            alert('Product added successfully!');
            setName('');
            setPrice(0);
            setCategory('');
        } catch (e) {
            alert('Failed to add product!',e);
        }
    };

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <h1>Add Product</h1>
            <label>Product Name: </label>
            <input type="text" name="product" value={name} 
            onChange={(e) => setName(e.target.value)} /><br />
            <label>Price: </label>
            <input type="number" name="price" value={price}
            onChange={(e)=> setPrice(e.target.value)} /><br />
            <label>Category: </label>
            <input type="text" name="category" value={category}
            onChange={(e) => setCategory(e.target.value)} /><br />
            <button type="submit">Add Product</button>
        </form>
    </div>
  )
}

export default AddProduct