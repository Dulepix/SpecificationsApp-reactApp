import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Signup } from './Signup'; 
import { Login } from './Login'; 
import { Home } from './Home'; 
import { Dashboard } from './Dashboard';
import { Validate } from './Validate';
import { Profile } from './Profile';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
