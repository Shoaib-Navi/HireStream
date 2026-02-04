import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        singleJob:null,
    },
    reducers:{
        //actions
        setAllJobs:(state, action) =>{
            state.allJobs = action.payload;    //action.payload → new jobs data,    state.allJobs → old jobs data
        },
        setSingleJob:(state,action)=>{
            state.singleJob = action.payload;
        }

    },    
})

export const {setAllJobs, setSingleJob} = jobSlice.actions;
export default jobSlice.reducer;