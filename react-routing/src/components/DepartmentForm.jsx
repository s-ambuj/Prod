import {useState} from 'react'

const DepartmentForm = () => {
    const [departmentName, setDepartmentName] = useState('')  
  return (
    <div>
        <h1>Department Form</h1>
        <form>
            <label htmlFor='departmentname'>Department Name: </label>
            <select id='departmentname' value={departmentName} onChange={(e) => setDepartmentName(e.target.value)}>
                <option value=''>Select Department</option>
                <option value='HR'>HR</option>
                <option value='IT'>IT</option>
                <option value='Finance'>Finance</option>
            </select>
            <p>Selected Department: {departmentName}</p>
        </form>
    </div>
  )
}

export default DepartmentForm
//DOM - Document Object Model - Element, Attribute, Text
//rafce
//ES7+