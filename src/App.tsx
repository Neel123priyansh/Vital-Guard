import { Route, Routes, BrowserRouter } from 'react-router-dom'
import {Home} from '../Pages/Home'


const App = () => {

  // const [showLoader, setShowLoader] = useState(true)

  return (
    <>
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<Home/>}/>
        {/* <Route path='/Info-Page' element={<Info/>}/>
        <Route path='/Check' element={
        <PrivateRoute>
          <Check />
        </PrivateRoute>
        }
        />
        <Route path='/Verification' element={<OTPverf/>}/>
        <Route path='/Info-lab' element={<Info_lab/>}/>
        <Route path='/Mini-Project' element={<Info_project/>}/> */}
    </Routes>
    </BrowserRouter>
    </>
  )
}
export default App