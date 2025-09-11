export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-2 text-center">A tiny sidekick with a big impact</h1>
      <p className="text-1xl  mb-10 pb-6 text-center">No training. No scripts. Just one line of code and real conversations begin.</p>

      <div className="grid md:grid-cols-3 gap-1 justify-center">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="bg-limelemon w-[430px] h-[370px] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-4">

            <div className="flex w-[370px] h-[80px] bg-white rounded-lg items-center px-3">
             <input
              type="text"
               disabled
              placeholder="www.yourwebsite.com"
              className="w-full p-2 rounded-lg text-black bg-white"
            />
            <button className="bg-black text-white px-3 py-1 rounded-lg w-[190px] h-[50px]">
              Add Address
            </button>
            </div>
            
          </div>
          <div className="mt-6 ms-5 text-start space-y-3 max-w-[500px]">
            <h2 className="text-2xl font-bold">Step 1: Get your embed code</h2>
            <p className="text-start text-xl font-thin w-[85%]">
              Enter your website address. We’ll analyze your site and generate an
              embed code for your chatbot.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className="bg-purple w-[430px] h-[370px] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-6">
            <code className="block bg-black text-green-400 p-3 rounded-lg">
              {`<script src="https://yourdomain.com/embed.js"></script>`}
            </code>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="bg-white text-black px-1 py-1 rounded-lg">
               <img src="/icons8-wordpress-100.png" alt="Description of image" />
              </span>
              <span className="bg-white text-black px-1 py-1 rounded-lg"><img src="/icons8-wix-100.png" alt="Description of image" /></span>
              <span className="bg-white text-black px-1 py-1 rounded-lg">
                <img src="/icons8-square-100.png" alt="Description of image" />
              </span>
            </div>
          </div>
          <div className="mt-6 me-10 text-start space-y-3 max-w-[500px]">
            <h2 className="text-2xl font-bold ">Step 2: Add chatbot to your site</h2>
            <p className="text-start text-xl  font-thin w-[90%]" >Grab your embed code and drop it into your site. That’s all NEXA needs to get to work.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="bg-lemon w-[430px] h-[370px] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-6">
            <div className="bg-black p-3 rounded-lg text-white w-full">
              <p>You have a new conversation!</p>
              <input
                type="text"
                 disabled
                placeholder="Ask NEXA AI..."
                className="w-full p-2 rounded-lg mt-2 border"
              />
            </div>
          </div>
          <div className="mt-6 ms-2 space-y-3 max-w-[500px]">
            <h2 className="text-2xl font-bold text-start">Step 3: Go live in minutes — it’s free!</h2>
            <p className="text-start text-xl  font-thin w-[80%] ">
              NEXA will chat with your site visitors and send conversations to your mailbox.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
