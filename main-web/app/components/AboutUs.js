import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl bg-[#d4e8e8] p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-teal-600 font-medium mb-2">A bit</p>
            <h2 className="text-4xl md:text-5xl font-bold text-black italic">About us</h2>
          </div>
          
          {/* Description */}
          <p 
            className="text-center text-gray-800 max-w-3xl mx-auto mb-10 text-2xl font-bold"
            style={{
              lineHeight: '140%',
              letterSpacing: '-0.025em'
            }}
          >
            BTS DISC 2.0 is a popular entertainment venue in Patna that combines a high-energy 
            dance club with a multi-cuisine restaurant and hookah lounge With locations at Dinkar 
            Golambar and West Boring Canal Road, it is known for its vibrant nightlife on saturday and 
            sunday , featuring professional DJs, neon-lit dance floors, and themed events like Bollywood and EDM nights
          </p>
          
          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden">
              <Image
                src="/img-home/about-us-1.png"
                alt="Club lights"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden">
              <Image
                src="/img-home/about-us-2.png"
                alt="Cocktails"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-4/5 rounded-2xl overflow-hidden">
              <Image
                src="/img-home/about-us-3.png"
                alt="DJ mixing"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
