import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        // becomes true once /user/me has answered on app load (not persisted)
        sessionChecked:false
    },
    reducers:{
        //actions
        setLoading:(state,action)=>{
            state.loading = action.payload;
        },
        setUser:(state,action)=>{
            state.user = action.payload;
        },
        setSessionChecked:(state,action)=>{
            state.sessionChecked = action.payload;
        }
    }
})
export const {setLoading, setUser, setSessionChecked} = authSlice.actions;
export default authSlice.reducer;
