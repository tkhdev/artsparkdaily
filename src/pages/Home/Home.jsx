import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagic,
  faDice,
  faArrowRight,
  faHeart,
  faLightbulb,
  faWandMagicSparkles,
  faShareNodes
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function Home() {
  return (
    <>
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 hero-gradient">
            Daily AI Art Challenge
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create, share, and connect through AI-generated art with daily
            creative prompts
          </p>

          <div className="flex justify-center space-x-8 mt-12">
            <div className="counter-card rounded-xl p-4 w-32">
              <h3 className="text-3xl font-bold text-pink-400">4,872</h3>
              <p className="text-sm text-gray-400">Artists</p>
            </div>
            <div className="counter-card rounded-xl p-4 w-32">
              <h3 className="text-3xl font-bold text-purple-400">14,320</h3>
              <p className="text-sm text-gray-400">Creations</p>
            </div>
            <div className="counter-card rounded-xl p-4 w-32">
              <h3 className="text-3xl font-bold text-blue-400">217</h3>
              <p className="text-sm text-gray-400">Challenges</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-xl border border-white/10 overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 mb-3">
                  Today's Challenge
                </span>
                <h2 className="text-3xl font-bold">Cosmic Dreams</h2>
                <p className="text-gray-300 mt-2">
                  Create art that blends cosmic elements with dreamlike imagery
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <span className="text-gray-400 text-sm">Time remaining</span>
                <div className="text-2xl font-mono font-bold text-white mt-1">
                  14:35:22
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative bg-black/30 backdrop-blur rounded-xl p-6 border border-white/10">
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Your Prompt
                </label>
                <textarea
                  id="prompt"
                  rows="3"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your cosmic dream scene..."
                ></textarea>

                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <button className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all">
                    <FontAwesomeIcon icon={faMagic} className="mr-2" />
                    <span>Generate Art</span>
                  </button>
                  <button className="border border-purple-500/50 hover:bg-purple-500/20 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center transition-all">
                    <FontAwesomeIcon icon={faDice} className="mr-2" />
                    <span>Random Inspiration</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured Creations</h2>
          <a
            href="#"
            className="text-purple-400 hover:text-purple-300 flex items-center"
          >
            <span>View All</span>
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[147, 92, 204].map((likes, idx) => (
            <div
              key={idx}
              className="art-card rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm"
            >
              <div className="relative aspect-square">
                <img
                  src="https://picsum.photos/200/200"
                  alt="AI generated art"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1 m-3 rounded-full flex items-center">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-red-500 mr-1"
                  />
                  <span className="text-sm">{likes}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img
                      src="https://picsum.photos/200/200"
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      {["ArtisticMind", "CosmicCreator", "StarDreamer"][idx]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {[2, 4, 6][idx]} hours ago
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {
                    [
                      `"Cosmic dreams dancing through the nebulae, where stars are born and wishes fly"`,
                      `"Deep space slumbers where gravity pulls dreams into spiraling galaxies"`,
                      `"Ethereal cosmic jellyfish floating through the multiverse"`,
                    ][idx]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-b from-transparent to-purple-900/20 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create AI-powered art in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faLightbulb} className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Get Inspired</h3>
            <p className="text-gray-300">
              Discover the daily challenge prompt and let your imagination flow
            </p>
          </div>

          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faWandMagicSparkles}
                className="text-3xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Create Art</h3>
            <p className="text-gray-300">
              Use our AI-powered tool to transform your ideas into stunning
              visuals
            </p>
          </div>

          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 mx-auto flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faShareNodes} className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Share & Connect</h3>
            <p className="text-gray-300">
              Submit to the gallery, receive feedback, and connect with fellow
              artists
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="bg-white text-purple-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
            Start Creating Now
          </button>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-3xl shadow-xl border border-white/10 overflow-hidden">
          <div className="px-8 py-16 sm:p-16 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join our creative community today
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Connect with thousands of artists, get inspired daily, and share
              your unique AI-generated creations with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faGoogle} className="mr-2" />
                Sign up with Google
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
