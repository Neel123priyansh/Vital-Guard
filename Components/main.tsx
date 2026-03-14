import testing_img from "../src/assets/Different-Types-of-Diagnostic-Tests.jpg"

export default function Main() {


  return (
        <div className=" flex flex-row justify-evenly w-[90%] mt-20 bg-white rounded-3xl mx-auto py-20 px-4">
          <div className='flex flex-col justify-evenly w-[40%] py-3'>
            <h1 className="font-Raleway font-bold text-[#022633] w-full text-3xl leading-[1.12] tracking-tight">
             At the forefront of defining disease
            </h1>
            <h1 className="text-2xl mt-10 font-Raleway text-[#022633 w-full leading-[1.12] tracking-tight">
             Our proprietary Quantitative Counting Templates (QCTs™) power our smNGS platform and our ability to directly measure sparse disease-causing DNA fragments, or molecules, at the single base-pair level. Several common and severe recessive conditions screened for prenatally are caused by single-base pair alterations
            </h1>
            <h1 className="text-2xl mt-5 font-Raleway text-[#022633 w-full leading-[1.12] tracking-tight">
             Our technology enables quantifying these minute variations using cell-free DNA. We believe this quantification will open the door to exponential improvements in prenatal screening, liquid biopsy, and beyond.
            </h1>
          </div>
          <img className="h-[400px] rounded-3xl" src={testing_img}/>
    </div>
  );
}