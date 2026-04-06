import { Route, Routes, BrowserRouter } from 'react-router-dom'
import {Home} from '../Pages/Home'
import Login from '../Components/login'
import Signup from '../Components/signup'
import Dashboard from '../Pages/dashboard'


const App = () => {

  return (
    <>
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}
export default App