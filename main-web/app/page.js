import Image from "next/image";
import AboutUs from "./components/AboutUs";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-5 rounded-full -xl backdrop-blur-xl bg-white/70">
        {/* Left button */}
        <button className="flex items-center gap-2 rounded-full bg-purple-200/80 px-5 py-2.5 text-sm font-semibold text-purple-900 hover:bg-purple-300 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Bookings
        </button>

        {/* center links */}
        <div className="flex items-center gap-10 font-semibold">
          <a href="#" className="text-gray-800 text-lg hover:text-purple-600 transition">Home</a>
          <a href="#" className="text-gray-800 text-lg hover:text-purple-600 transition">Events</a>
          <a href="#" className="text-gray-800 text-lg hover:text-purple-600 transition">Discover</a>
          <a href="#" className="text-gray-800 text-lg hover:text-purple-600 transition">Contact Us</a>
        </div>

        {/* right CTA */}
        <button className="rounded-full bg-linear-to-r from-purple-100 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-300/50 hover:scale-[1.03] active:scale-95 transition">
          Order Food
        </button>
      </nav>


      {/* Hero Section */}
      <section className="px-8 pt-8 pb-16">
        <div className="mt-0">
          {/* Hero Text */}
          <h1 className="text-7xl ml-20 lg:text-9xl  -tracking-[0.07em] font-black leading-none">
            WELCOME TO
          </h1>

          <h2
            className="text-7xl text-center lg:text-9xl font-extrabold text-transparent [-webkit-text-stroke:2px_black] -tracking-[0.07em] leading-none mt-2"
          >
            BTS & DISCO
          </h2>


          {/* Hero Image Container */}
          <div className="mt-[60px] mx-auto w-[96vw] h-[53vh] rounded-3xl relative p-6 bg-blue-600/30 backdrop-blur-xl border border-white/30 shadow-2xl">
            <div className="absolute z-10 h-[500px]  w-[1200px] -top-[60px] left-1/2 -translate-x-1/2  text   rounded-2xl ">
              <Image
                src="/img-home/hero.png"
                alt="BTS & Disco concert"
                fill
                className="rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="">
        <div className=" mx-8">
          <div className="rounded-[80px] overflow-hidden border-[50px] border-[#d4e8e8] p-8 md:p-12">
            {/* Header */}
            <div className="text-center relative my-8">
              <p className="text-teal-600 font-extrabold text-center pr-[200px] ">A bit</p>
              <h2 className="text-4xl md:text-6xl font-bold text-black  ">About us</h2>
            </div>

            {/* Description */}
            <p
              className="text-center text-gray-800 max-w-5xl mx-auto mb-10 text-2xl font-bold"
              style={{
                lineHeight: '140%',
                letterSpacing: '-0.025em'
              }}
            >
              BTS DISC is a popular entertainment venue in Patna that combines a high-energy
              dance club with a multi-cuisine restaurant and hookah lounge With locations at Dinkar
              Golambar and West Boring Canal Road, it is known for its vibrant nightlife on saturday and
              sunday , featuring professional DJs, neon-lit dance floors, and themed events like Bollywood and EDM nights
            </p>

            {/* Images Grid */}
            <div className=" mx-auto w-[71vw] h-[33vh] rounded-xl relative mt-20 p-6 bg-blue-600/15 backdrop-blur-xl border border-white/30 shadow-2xl">
              <div className=" flex absolute -top-10 items-center justify-center gap-12">
                <div className="relative h-70 w-100 rounded-2xl ">
                  <Image
                    src="/img-home/about-us-1.png"
                    alt="Club lights"
                    fill
                    className="z-50 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2
                  w-[85%] h-32 rounded-full
                  bg-red-400/70 blur-2xl shadow-2xl"></div>
                </div>
                <div className="relative h-70 w-100 rounded-2xl ">
                  <Image
                    src="/img-home/about-us-2.png"
                    alt="Cocktails"
                    fill
                    className="z-50 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2
                  w-[85%] h-32 rounded-full
                  bg-red-400/70 blur-2xl shadow-2xl"></div>
                </div>
                <div className="relative h-70 w-100 rounded-2xl ">
                  <Image
                    src="/img-home/about-us-3.png"
                    alt="DJ mixing"
                    fill
                    className="z-50 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-6 left-1/2 z-40 -translate-x-1/2
                  w-[85%] h-32 rounded-full
                  bg-red-400 blur-2xl shadow-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="relative w-full max-w-7xl mx-auto px-4 py-20">

        {/* floating gradient blobs */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-20 right-10 w-36 h-36 bg-slate-800 rounded-full blur-2xl opacity-70" />

        {/* heading + text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* left title */}
          <h2 className="text-7xl font-extrabold text-transparent [-webkit-text-stroke:2px_black] leading-none">
            Events
          </h2>

          {/* right text */}
          <div className="text-lg leading-relaxed text-center md:text-left">
            <p>
              The venue is a one-stop destination for private bookings, including birthday parties,
              corporate events, and farewells, with users praising the “cooperative and polite” staff
              and “delicious” food.
            </p>

            <p className="mt-4 font-medium">
              Beyond standard clubbing, they also host unique themed events.
            </p>
          </div>
        </div>

        {/* images */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* image 1 */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="/img-home/events-1.jpg" className="object-cover w-full h-[340px]" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-20 rounded-full bg-pink-400/70 blur-3xl" />
          </div>

          {/* image 2 */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="/img-home/events-2.jpg" className="object-cover w-full h-[340px]" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-20 rounded-full bg-purple-400/70 blur-3xl" />
          </div>
        </div>
      </section>



    </div>
  );
}
