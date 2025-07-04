import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { fetchProfile } from '../profile/profileSlice'

// Login function using createAsyncThunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ employeeId, password }, thunkAPI) => {
    try {
      const resp = await axios.post('/api/login', { id: employeeId, password }) // HTTP POST request to login endpoint
      const { id } = resp.data
      // immediately load profile for this user
      thunkAPI.dispatch(fetchProfile(id))
      return { id }
    } catch (err) {
      if (err.response?.status === 401) {
        return thunkAPI.rejectWithValue('Incorrect employee ID or password')
      }
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

// 
const authSlice = createSlice({
  name: 'auth',
  initialState: { // initial state object defines the structure of the auth state
    currentUser: null,    // stores info about the logged-in user
    status:      'idle',  // tracks the status of the login request
    error:       null
  },
  reducers: { // defines sycchronous actions for updating the state
    logout(state) { // clears the current user and resets state
      state.currentUser = null
    }
  },
  extraReducers: builder => { // handles actions generated by async thunks
    builder
      .addCase(login.pending, state => { // updates status to 'loading' when login request is pending
        state.status = 'loading'
        state.error  = null
      })
      .addCase(login.fulfilled, (state, action) => { // updates status to idle when currrentUser conatins the logged-in user ID
        state.status      = 'idle'
        state.currentUser = { id: action.payload.id }
      })
      .addCase(login.rejected, (state, action) => { // updates status to 'error' when login request fails
        state.status = 'error'
        state.error  = action.payload || action.error.message
      })
  }
})

// exports logout action and reducer function to allow usage in other parts of the app
export const { logout } = authSlice.actions
export default authSlice.reducer