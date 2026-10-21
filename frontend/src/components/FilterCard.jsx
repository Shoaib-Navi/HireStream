import React, { useId } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group.jsx'
import { Label } from './ui/label'
import { JOB_FILTERS } from '@/lib/jobFilters'

// Controlled by the parent (Jobs page): one selection per filter category
const FilterCard = ({ activeFilters, setActiveFilters }) => {
  // unique ids, because the desktop panel and the mobile drawer can both be mounted
  const baseId = useId();

  const changeHandler = (type, value) => {
    setActiveFilters((prev) => ({ ...prev, [type]: [value] }));
  };

  return (
    <div className='w-full bg-white p-3 rounded-md'>
      <h1 className='font-bold text-lg'>Filter Jobs</h1>
      <hr className='mt-3' />
      {JOB_FILTERS.map(({ type, options }, typeIndex) => (
        <RadioGroup
          key={type}
          value={activeFilters[type]?.[0] ?? ''}
          onValueChange={(value) => changeHandler(type, value)}
          className='mt-3 gap-0'
        >
          <h2 className='font-bold text-lg'>{type}</h2>
          {options.map((option, optionIndex) => {
            const itemId = `${baseId}-${typeIndex}-${optionIndex}`;
            return (
              <div key={option} className='flex items-center space-x-2 my-2'>
                <RadioGroupItem value={option} id={itemId} />
                <Label htmlFor={itemId}>{option}</Label>
              </div>
            )
          })}
        </RadioGroup>
      ))}
    </div>
  )
}

export default FilterCard;
