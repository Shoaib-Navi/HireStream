import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";

const CompaniesTable = () => {
  //   const {companies, searchCompanyByText} = useSelector(store => store.company);
  //   const [filterCompany, setFilterCompany] = useState(companies);
  //   const navigate = useNavigate();

  //   useEffect(()=>{
  //     const filteredCompany = companies.length >= 0 && companies.filter((company)=>{
  //       if(!searchCompanyByText){
  //         return true;
  //       }
  //     })
  //   })
  return (
    <div>
      <Table>
        <TableCaption>A list of your recent registered companies</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right ">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableCell>
            <Avatar>
              <AvatarImage src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAclBMVEXz8/PzUyWBvAYFpvD/ugjz9fb19Pbz+fr39fr69vPy9frzRAB5uAAAofD/tgDz2tXh6tLzTBbzmoix0oCAxfH70IHS5vL16dLz5ODo7d/zPQDzlIGs0Hje6/N4wvH7znn07d8AnvDzvrPL3q+v1/L43q8L8zFJAAABeUlEQVR4nO3cR24CURREURy6ScbknB32v0VPTAuJL3lU4MG5G3g6evNqtSRJ0lVVvOZUHa8oHKZbXYj1epSu9MHhpp9ts23/3urs3tKNbr9YDftP2caTRjh9DkdISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh4X+FmnK1/vV/6COFqO8m2/Wg2aD9302y7dWFnt2qnu9oR7qQrDwlLkvRn3XjNqbqXrioA94dZtsPXhVh/H+fZjqcCcXEehDtchL3je7plSTh4yTaYNcL5+2s2QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCwvsK0/ul50fvl1aLdPvm1GmZrnsLvGtVvAcDJUn6Z/0AqSRGNlRkRI0AAAAASUVORK5CYII=" />
            </Avatar>
          </TableCell>
          <TableCell>Google</TableCell>
          <TableCell>09-02-2026</TableCell>
          <TableCell className="text-right cursor-pointer " >
            <Popover>
                <PopoverTrigger className="cursor-pointer" ><MoreHorizontal/></PopoverTrigger>
                <PopoverContent className="w-32" >
                    <div className="flex items-center gap-2 w-fit cursor-pointer" >
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                    </div>
                </PopoverContent>
            </Popover>
          </TableCell>
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
