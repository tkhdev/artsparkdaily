import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faHeart,
  faFire,
  faSortDown,
  faUpload,
  faComment,
  faShareAlt,
  faEye
} from "@fortawesome/free-solid-svg-icons";

export default function Gallery() {
  return (
    <main className="max-w-7xl mx-auto p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 my-12">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-extrabold drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Today's Challenge</span>
          </h1>
          <p className="mt-2 text-pink-300 text-lg max-w-xl leading-relaxed">
            Prompt: <span className="font-semibold text-white">"Surreal Cyberpunk Cityscape at Dusk"</span>
          </p>
          <p className="mt-1 text-pink-400 text-sm">
            Challenge #42 — Generated May 21, 2025, 00:00 UTC
          </p>
        </div>

        <div className="flex gap-8 items-center text-pink-400 select-none">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} className="w-5 h-5" />
            <span>325 Submissions</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
            <span>12.4K Likes</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-yellow-400" />
            <span>5-Day Streak</span>
          </div>
        </div>
      </header>

      <section aria-label="Gallery filters and controls" className="mb-10 flex flex-wrap gap-4 items-center justify-between">
        <select aria-label="Filter by challenge date" className="rounded-xl bg-pink-900/60 border border-pink-600 text-white px-4 py-2 focus:outline-none focus:ring-4 focus:ring-pink-600 transition">
          <option value="today" defaultValue="today">Today's Challenge</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="all">All Time</option>
        </select>

        <select aria-label="Sort submissions by" className="rounded-xl bg-pink-900/60 border border-pink-600 text-white px-4 py-2 focus:outline-none focus:ring-4 focus:ring-pink-600 transition">
          <option value="newest" defaultValue="newest">Newest</option>
          <option value="popular">Most Liked</option>
          <option value="comments">Most Commented</option>
          <option value="random">Random</option>
        </select>

        <input type="search" placeholder="Search by user or title..." aria-label="Search gallery submissions" className="flex-grow min-w-[250px] rounded-xl bg-pink-900/40 border border-pink-600 placeholder-pink-500 text-white px-4 py-2 focus:outline-none focus:ring-4 focus:ring-pink-600 transition" />

        <button aria-label="Upload new artwork" className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 active:scale-95 transition-transform duration-200 rounded-full px-5 py-2 font-semibold shadow-lg text-white">
          <FontAwesomeIcon icon={faUpload} className="h-5 w-5" />
          Upload
        </button>
      </section>

      <section aria-label="Daily AI Art submissions gallery" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
        <article tabIndex={0} className="relative group rounded-3xl overflow-hidden shadow-xl border-2 border-pink-600 hover:border-pink-400 focus:border-pink-400 transition-all duration-300 cursor-pointer bg-pink-900/40">
          <img src="https://picsum.photos/id/1015/400/400" alt="Surreal Cyberpunk Cityscape at Dusk by user Luna" className="object-cover w-full h-64 rounded-t-3xl transition-transform group-hover:scale-105" loading="lazy" />
          <div className="p-5 space-y-2">
            <h3 className="text-xl font-bold text-white drop-shadow-lg truncate" title="Surreal Cyberpunk Cityscape at Dusk">
              Surreal Cyberpunk Cityscape at Dusk
            </h3>
            <p className="text-pink-300 text-sm truncate" title="by Luna">
              by <a href="#" className="text-pink-400 hover:text-pink-200 underline">Luna</a>
            </p>
            <p className="text-pink-400 text-xs truncate" title="Submission caption or description">
              A dreamy cyberpunk city glowing under dusk skies, inspired by the daily prompt.
            </p>

            <div className="flex justify-between items-center mt-3 text-pink-400 select-none">
              <button type="button" aria-label="Like submission" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                <span>327</span>
              </button>

              <button type="button" aria-label="View comments" className="flex items-center gap-1 hover:text-pink-200 focus:outline-none">
                <FontAwesomeIcon icon={faComment} className="h-5 w-5" />
                <span>41</span>
              </button>

              <time dateTime="2025-05-21T14:32" className="text-xs text-pink-300 select-text" title="Submitted May 21, 2025 at 14:32 UTC">May 21</time>
            </div>
          </div>

          <div className="absolute inset-0 bg-pink-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 rounded-3xl flex flex-col justify-center items-center gap-6 p-6" aria-hidden="true">
            <button aria-label="Like submission" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
              Like
            </button>
            <button aria-label="View submission details" className="flex items-center gap-2 border border-pink-600 text-pink-400 hover:text-pink-100 hover:border-pink-400 rounded-full px-5 py-2 font-semibold transition">
              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
              View
            </button>
            <button aria-label="Share submission on social media" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full px-5 py-2 font-bold text-white shadow-lg select-none transition">
              <FontAwesomeIcon icon={faShareAlt} className="h-5 w-5" />
              Share
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
