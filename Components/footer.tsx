export default function Footer() {

  return (
    <footer className="bg-[#022633] text-white pt-10">
      <div className="max-w-full px-6 mx-auto grid grid-cols-1 md:grid-cols-3 gap-1">

        {/* Newsletter */}
        <div>
          <h2 className="text-xl tracking-wide mb-6 font-urbanist uppercase">
            Connect to Us
          </h2>

          <div className="flex items-center border-b font-urbanist border-white max-w-md">
            <input
              type="email"
              placeholder="name@email.com"
              className="bg-transparent outline-none py-2 flex-1 placeholder-white"
            />
            <button className="bg-[white] text-black font-urbanist px-8 py-2 text-sm tracking-wide">
              SEND
            </button>
          </div>

          <div className="mt-8 text-sm font-urbanist" >
            <p>VitalGuard.</p><p className="text-[10px] mb-5">by Raphson Robotics</p>
            <p>All rights reserved 2025</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:pl-72">
        </div>

        {/* Contact */}
        <div className="flex flex-row pl-10 justify-between font-urbanist">
            <div className="flex flex-col">
                <h3 className="text-lg uppercase mb-6 font-urbanist">Quick Links</h3>
                <ul className="space-y-2 font-urbanist">
                    <li className="hover:underline cursor-pointer">Home</li>
                    <li className="hover:underline cursor-pointer">About us</li>
                    <li className="hover:underline cursor-pointer">Price</li>
                    <li className="hover:underline cursor-pointer">Contact us</li>
                </ul>
            </div>
            <div className="flex flex-col">
                <h3 className="text-lg uppercase mb-6 font-urbanist">Find Us</h3>
                <p className="leading-relaxed font-urbanist">
                    Akash-Vihar, 1st Floor,<br />Sikri Kalan,<br />ModiNagar, UttarPradesh<br/>203204
                </p>
                {/* <p className="mt-2">+91 6969696969</p> */}
            </div>
        </div>
      </div>
      <h1 className='text-[280px] mt-10 font-bold text-[#ECE5E5] text-center'>VitalGuard.</h1>
      <h1 className='text-[15px] font-Raleway text-[#ECE5E5] text-center'>Made with ❤️ by Disha, Aanya, Priyansh</h1>
    </footer>
  );
}