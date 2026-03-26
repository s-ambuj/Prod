import React, {useState} from 'react'

const SkillForm = () => {
    const [skills, setSkills] = useState([])

    const handleChange = (e) =>{
        const value = e.target.value
       setSkills((prevSkills) => {
        if(prevSkills.includes(value)){
            return prevSkills.filter((skill) => skill !== value)
        } else {
            return [...prevSkills, value]
        }
    })
  }
  return (
    <div>
        <form>
        <h1>Skill Form</h1>
        <label>Skill Name: </label>
        <input type="checkbox" name="skill" value="JavaScript" onChange={handleChange} /> JavaScript
        <input type="checkbox" name="skill" value="Python" onChange={handleChange} /> Python
        <input type="checkbox" name="skill" value="React" onChange={handleChange} /> React
        <input type="checkbox" name="skill" value="C++" onChange={handleChange} /> C++
        <p>Selected Skills: {skills.join(', ')}</p>
        </form>
    </div>
  )
}
export default SkillForm