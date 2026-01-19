import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage  } from "../ui/avatar";
import { Button } from "../ui/button";
import { User,LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = false;
  return (
    <>
      <div className="bg-amber-200">
        <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
          <div>
            <h1 className="text-2xl font-bold">
              Hire<span>Stream</span>
            </h1>
          </div>
          <div className="flex items-center gap-12">
            <ul className="flex font-medium items-center gap-5">
              <li>Home</li>
              <li>Jobs</li>
              <li>Browse</li>
            </ul>
            {
              !user ? (
                <div className="flex items-center gap-2">
                 <Link to='/login'><Button variant="outline">Login</Button></Link>
                  <Link to='/signup'><Button className="bg-[#6A38c2] hover:bg-[#5b30a6]">SignUp</Button></Link>
                </div>
              ):(
                 <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                </Avatar>
              </PopoverTrigger>
               <PopoverContent className="w-80">
             <div>
              <div className="flex gap-4 space-y-2">
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                </Avatar>
                <div>
                  <h4 className="font-medium">H&C company</h4>
                  <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet.</p>
                </div>

             </div>
             <div className="flex flex-col text-gray-600 m-2">
              <div className="flex w-fit items-center gap-2 cursor-pointer">
                <User/>
                <Button variant='link'>View Profile</Button>
              </div>
              <div className="flex w-fit items-center gap-2 cursor-pointer">
                <LogOut/>
                <Button variant='link'>Logout</Button>
              </div>

             </div>
             </div>
              </PopoverContent>
            </Popover>

              )
            }

           
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
