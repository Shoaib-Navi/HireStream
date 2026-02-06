import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const Job = ({job}) => {
    const navigate = useNavigate();
    const daysAgoFunction = (mongodbTime) =>{
      const createdAt = new Date(mongodbTime);
      const currentTime = new Date();
      const timeDifference = currentTime - createdAt;
      return Math.floor(timeDifference/(24*60*60*1000));   //change time into days grom millisecond
    }

  return (
    <div className='p-5 rounded-md bg-white shadow-xl border border-gray-100'>
        <div className="flex justify-between">
            <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) == 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
            <Button variant='outline' className="rounded-full" size='icon'><Bookmark/></Button>
        </div>

      <div className="flex items-center gap-2 my-2">
      <Button className="p-6" variant='outline' size='icon'>
        <Avatar>
            <AvatarImage src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAclBMVEXz8/PzUyWBvAYFpvD/ugjz9fb19Pbz+fr39fr69vPy9frzRAB5uAAAofD/tgDz2tXh6tLzTBbzmoix0oCAxfH70IHS5vL16dLz5ODo7d/zPQDzlIGs0Hje6/N4wvH7znn07d8AnvDzvrPL3q+v1/L43q8L8zFJAAABeUlEQVR4nO3cR24CURREURy6ScbknB32v0VPTAuJL3lU4MG5G3g6evNqtSRJ0lVVvOZUHa8oHKZbXYj1epSu9MHhpp9ts23/3urs3tKNbr9YDftP2caTRjh9DkdISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh4X+FmnK1/vV/6COFqO8m2/Wg2aD9302y7dWFnt2qnu9oR7qQrDwlLkvRn3XjNqbqXrioA94dZtsPXhVh/H+fZjqcCcXEehDtchL3je7plSTh4yTaYNcL5+2s2QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCwvsK0/ul50fvl1aLdPvm1GmZrnsLvGtVvAcDJUn6Z/0AqSRGNlRkRI0AAAAASUVORK5CYII="/>
        </Avatar>
      </Button>
      <div>
        <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
        <p className='text-sm text-gray-500'>India</p>
      </div>
      </div>
      <div>
        <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
        <p className='text-sm text-gray-600'>{job?.description}</p>
      </div>
        <div className="flex items-center gap-2 mt-4">
        <Badge className={"text-blue-700 font-bold"} variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className={"text-[#f83002] font-bold"} variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
          {job?.salary}LPA
        </Badge>
      </div>
      <div className='flex items-center gap-4 mt-4'>
        <Button variant='outline' onClick={()=>navigate(`/description/${job?._id}`)} >Details</Button>
        <Button className="bg-[#7209b7] ">Save For Later</Button>
      </div>
    </div>
  )
}

export default Job
