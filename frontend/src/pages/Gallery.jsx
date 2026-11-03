import { useEffect, useState } from "react";
import axios from "axios";
import { ImageIcon, Loader2, X } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { API } from "../config/school";

const CATEGORIES = ["All", "Classrooms", "Activities", "Sports", "Events", "Building", "General"];

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const qs = cat === "All" ? "" : `?category=${encodeURIComponent(cat)}`;
        const { data } = await axios.get(`${API}/public/gallery${qs}`);
        setPhotos(data);
      } catch {
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cat]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-testid="gallery-public-page">
      <SEO
        title="Photo Gallery | The Study Home School, Arrah Bhojpur"
        description="Photos from The Study Home School — classrooms, activities, sports and events as the school grows in Arrah, Bhojpur."
      />
      <PageHero
        eyebrow="Photo gallery"
        title="Our School, In Pictures"
        description="Classrooms, activities, sports and events — watch the school grow, photo by photo."
      />
      <section className="py-14 sm:py-20 bg-white">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter photos">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${cat === c ? "bg-[#0756A5] text-white" : "bg-[#F3F6FA] text-[#123D62] border border-slate-200 hover:border-[#0756A5]"}`}
                  data-testid={`gallery-filter-${c.toLowerCase()}`}>
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
          ) : photos.length === 0 ? (
            <div className="mt-10 text-center py-12 rounded-2xl bg-[#F3F6FA]" data-testid="gallery-public-empty">
              <ImageIcon size={36} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#64748B]">No photos yet. The school will share pictures as it takes shape.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.05}>
                  <button type="button" onClick={() => setLightbox(p)}
                    className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left"
                    data-testid={`gallery-photo-${p.id}`}>
                    <div className="aspect-square bg-slate-100">
                      <img src={`data:${p.content_type};base64,${p.data_b64}`} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="font-semibold text-xs text-[#123D62] truncate">{p.title}</p>
                      {p.caption && <p className="text-[10px] text-[#64748B] truncate mt-0.5">{p.caption}</p>}
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.title} data-testid="gallery-lightbox">
          <button type="button" onClick={() => setLightbox(null)} aria-label="Close" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <X size={20} aria-hidden="true" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={`data:${lightbox.content_type};base64,${lightbox.data_b64}`} alt={lightbox.title} className="w-full max-h-[75vh] object-contain rounded-2xl" />
            <p className="mt-3 text-center text-white text-sm font-semibold">{lightbox.title}{lightbox.caption ? ` — ${lightbox.caption}` : ""}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
