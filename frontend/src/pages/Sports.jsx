import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, Users, Sun, CircleDot, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { IMAGES } from "../config/school";

const BENEFITS = [
  { icon: HeartPulse, title: "Healthy bodies", text: "Regular movement builds strength, coordination, posture and the habit of an active life." },
  { icon: Users, title: "Cooperation & fair play", text: "Games teach children to play by rules, include others, win with humility and lose with grace." },
  { icon: Sun, title: "Confidence & resilience", text: "Trying, falling and trying again in play builds the courage children need in the classroom too." },
];

const ACTIVITIES = [
  "Warm-ups, stretching and simple exercises",
  "Running, relay and balancing games",
  "Catching, throwing and aiming games",
  "Simple team games suited to the available space",
  "Free, supervised play in the play area",
  "Movement with music and rhythm",
];

const Sports = () => (
  <div data-testid="sports-page">
    <SEO
      title="Sports & Well-being | The Study Home School, Bhojpur"
      description="Sports, movement and play at The Study Home School: physical coordination, teamwork, fair play and healthy habits for primary-age children, planned around the school's play area."
    />
    <PageHero
      eyebrow="Sports & well-being"
      title="Growing Healthy, Confident and Cooperative"
      description="Sport at the primary age is not about competition. It is about movement, joy, teamwork and habits that last a lifetime."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <article className="card-site h-full" data-testid={`sports-benefit-${i + 1}`}>
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]">
                  <b.icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#123D62]">{b.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{b.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="eyebrow">What children will do</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">Age-Appropriate Games & Activities</h2>
            <ul className="mt-6 space-y-3">
              {ACTIVITIES.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm sm:text-base text-[#1E293B]">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />{a}
                </li>
              ))}
            </ul>
            <div className="mt-7 rounded-2xl border border-[#F2D9B8] bg-[#FDF6EC] p-5" data-testid="sports-honest-note">
              <div className="flex items-start gap-3">
                <CircleDot size={18} className="mt-0.5 shrink-0 text-[#D97706]" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-[#475569]">
                  <strong className="text-[#123D62]">An honest note:</strong> the planned premises
                  include eight rooms and a play area. Activities will always depend on age, safety,
                  weather and available space. The school does not claim a large playground,
                  swimming pool or specialised sports equipment at this stage.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
              <img src={IMAGES.sportsActivity.src} alt={IMAGES.sportsActivity.alt} className="w-full h-full object-cover" loading="lazy" data-testid="sports-page-image" />
            </div>
            <p className="mt-3 text-xs text-[#64748B]">Illustrative photograph. It does not depict the actual school, teachers or students.</p>
            <Link to="/admissions#enquiry-form"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              data-testid="sports-page-enquiry-cta">
              Ask about sports & well-being <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  </div>
);

export default Sports;
