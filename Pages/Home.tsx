import Header from "../Components/Header"
import Main from "../Components/main"
import Transparent_main from "../Components/transparent_main"
// import Card from "../components/Main/main-part-card"
// import About from "../components/About/about"
// import Logo from "../components/logo/logo";
// import Text from '../components/About/text'
// import People from '../components/About/people'
import Footer from "../Components/footer";

export const Home = () => {
  return (
    <>
    <div className="bg-gradient-to-r scroll-smooth snap-y snap-mandatory  from-[#f7efd8] via-[#0f7eee]/50 via-80% ">
    <Header/>
    <Main/>
    <Transparent_main/>
    <Footer/>
    {/* // <Card/>
    // <Logo/>
    // <Text/>
    // <About/>
    // <People/>
    
    // <Footer/> 
    // {/* <Why/>
    // <Step/> */}
    </div>
    </>
  )
}
