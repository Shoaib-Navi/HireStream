import React from 'react'

const filterData =[
    {
        filterType:"Location",
        array:["Delhi","Noida","Gurugram","Hyderabad","Bangalore","Pune","Mumbai"]
    },
    {
        filterType:"Role",
        array:["Frontend Developer","Backend Developer","FullStack Developer"]
    },
    {
        filterType:"Salary",
        array:["0-40k","40-99k","1-5lakh"]
    }
]

const FilterCard = () => {
  return (
    <div>
        <h1>Filter Jobs</h1>
        <hr className='mt-3'/>
      
    </div>
  )
}

export default FilterCard
