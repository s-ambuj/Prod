
import './App.css'
import {Routes, Route, Link} from 'react-router-dom'
import Home from './components/Home'
import Contact from './components/Contact'
import About from './components/About'
import NotFound from './components/NotFound'
import LoginForm from './components/LoginForm'
import DepartmentForm from './components/DepartmentForm'
import SkillForm from './components/SkillForm'
import ProductList from './components/ProductList'
import AddProduct from './components/AddProduct'

function App() {
  
  return (
    <>
      <nav>
        <ul className='flex justify-center gap-4 bg-gray-200 p-4'>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/contact'>Contact</Link></li>
          <li><Link to='/about'>About</Link></li>
          <li><Link to='/login'>Login</Link></li>
          <li><Link to='/department'>Department Form</Link></li>
          <li><Link to='/skill'>Skill Form</Link></li>
          <li><Link to='/products'>Product List</Link></li>
          <li><Link to='/add-product'>Add Product</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/department' element={<DepartmentForm />} />
        <Route path='/skill' element={<SkillForm />} />
        <Route path='/products' element={<ProductList />} />
        <Route path='/add-product' element={<AddProduct />} />
      </Routes>
    </>
  )
}

export default App

//npm install react-router-dom