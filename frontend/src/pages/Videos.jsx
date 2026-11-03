import { useEffect, useState } from "react";
import axios from "axios";
import { Youtube, Loader2 } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { API } from "../config/school";

const CLASSES = ["All", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [cls, setCls] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const qs = cls === "All" ? "" : `?class_name=${encodeURIComponent(cls)}`;
        const { data } = await axios.get(`${API}/public/videos${qs}`);
        setVideos(data);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cls]);

  return (
    <div data-testid="videos-public-page">
      <SEO
        title="Learning Videos | The Study Home School, Bhojpur"
        description="Class-wise learning videos from The Study Home School — watch lessons and activities for primary classes on YouTube."
      />
      <PageHero
        eyebrow="Learning videos"
        title="Watch & Learn, Class by Class"
        description="Lesson videos and activities shared by the school for each class. New videos are added as the school grows."
      />
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by class">
              {CLASSES.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cls === c} onClick={() => setCls(c)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${cls === c ? "bg-[#0756A5] text-white" : "bg-[#F3F6FA] text-[#123D62] border border-slate-200 hover:border-[#0756A5]"}`}
                  data-testid={`video-filter-${c.toLowerCase().replace(/\s/g, "-")}`}>
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
          ) : videos.length === 0 ? (
            <div className="mt-10 text-center py-12 rounded-2xl bg-[#F3F6FA]" data-testid="videos-public-empty">
              <Youtube size={36} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#64748B]">No videos for this class yet. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <Reveal key={v.video_id} delay={(i % 3) * 0.07}>
                  <article className="card-site !p-0 overflow-hidden h-full" data-testid={`public-video-${v.video_id}`}>
                    <div className="aspect-video bg-slate-100">
                      <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt={`${v.title} — video thumbnail`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <p className="font-semibold text-[#123D62]">{v.title}</p>
                      <p className="text-xs text-[#64748B] mt-1">{v.class_name}{v.subject ? ` • ${v.subject}` : ""}</p>
                      {v.description && <p className="mt-2 text-sm text-[#475569]">{v.description}</p>}
                      <a href={`https://www.youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
                        data-testid={`public-video-watch-${v.video_id}`}>
                        <Youtube size={16} aria-hidden="true" /> Watch on YouTube
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VideosPage;
