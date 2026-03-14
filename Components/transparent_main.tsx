import testing_img from "../src/assets/Different-Types-of-Diagnostic-Tests.jpg"

export default function Transparent_Main() {


  return (
        <div className=" flex flex-col justify-evenly w-[90%] rounded-3xl mx-auto py-20 px-20">
          <div className='flex flex-col justify-evenly w-full py-3'>
            <h1 className="font-Raleway font-bold text-[#022633] w-full text-2xl leading-[1.12] tracking-tight">
             OUR PRODUCT    
            </h1>
            <h1 className="text-3xl mb-6 mt-2 font-Raleway text-[#022633 w-full leading-[1.4] tracking-tight">
             Actionable insights from a single blood draw.
            </h1>

          </div>
<div className="flex flex-row gap-25 justify-center overflow-x-auto">

  {/* Card 1 */}
  <div className="relative min-w-[200px] w-[550px] h-[720px] rounded-3xl overflow-hidden flex-shrink-0 shadow-xl cursor-pointer group">
    {/* Background Image */}
    <img
      src={testing_img}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40" />

    {/* Top section: label + arrow */}
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-5 pt-5">
      <span className="text-white mt-10 text-xl px-7 font-bold tracking-widest uppercase">
        Prenatal
      </span>
    </div>

    {/* Middle section: description text */}
    <div className="absolute top-12 mt-5 left-0 right-0 z-10 px-5">
      <p className="text-white mt-10 px-7 text-lg leading-relaxed">
        <span className="font-bold">UNITY Complete®</span> is the first non-invasive prenatal test (NIPT) that uses cfDNA to assess fetal risk for recessive conditions and aneuploidy from a single maternal blood sample at 9+ weeks.
      </p>
    </div>

    {/* Bottom section: brand logo/name */}
    <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 flex items-center gap-2">
      <span className="text-white text-2xl font-bold tracking-wider">ij UNITY</span>
    </div>
  </div>

  {/* Card 2 */}
  <div className="relative min-w-[200px] w-[550px] h-[720px] rounded-3xl overflow-hidden flex-shrink-0 shadow-xl cursor-pointer group">
    {/* Background Image */}
    <img
      src={testing_img}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />

    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40" />

    {/* Top section: label + arrow */}
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-5 pt-5">
      <span className="text-white mt-10 text-xl px-7 font-bold tracking-widest uppercase">
        Prenatal
      </span>
    </div>

    {/* Middle section: description text */}
    <div className="absolute top-12 mt-5 left-0 right-0 z-10 px-5">
      <p className="text-white mt-10 px-7 text-lg leading-relaxed">
        <span className="font-bold">UNITY Complete®</span> is the first non-invasive prenatal test (NIPT) that uses cfDNA to assess fetal risk for recessive conditions and aneuploidy from a single maternal blood sample at 9+ weeks.
      </p>
    </div>

    {/* Bottom section: brand logo/name */}
    <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 flex items-center gap-2">
      <span className="text-white text-2xl font-bold tracking-wider">ij UNITY</span>
    </div>
  </div>

</div>
    </div>
  );
}