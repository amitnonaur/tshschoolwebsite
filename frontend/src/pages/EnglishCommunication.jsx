import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const COMPONENTS = [
  { letter: "A", title: "Grammar & Sentence Construction", text: "Children learn how English sentences are built — naming words, action words, describing words — through examples and practice, not dry rules." },
  { letter: "B", title: "Vocabulary Development", text: "New words arrive through stories, pictures and daily classroom use, so children remember them by meeting them again and again." },
  { letter: "C", title: "Spelling & Pronunciation", text: "Regular dictation, sound patterns and careful reading build accurate spelling and clear, confident pronunciation." },
  { letter: "D", title: "Everyday Greetings & Useful Expressions", text: "Simple, polite everyday English — greetings, requests, thanking, asking questions — practised until it feels natural." },
  { letter: "E", title: "Reading Fluency & Comprehension", text: "From phonics and short sentences to longer passages, children learn to read smoothly and to understand and discuss what they read." },
  { letter: "F", title: "Listening & Speaking", text: "Listening activities, rhymes, instructions and guided conversation train the ear before the tongue — confidence grows gradually." },
  { letter: "G", title: "Writing Skills", text: "Neat handwriting, correct sentences and short compositions — writing is built step by step from letters to paragraphs." },
  { letter: "H", title: "Translation & Sentence Practice", text: "Where educationally useful, children translate between Hindi and English to understand both languages more deeply." },
  { letter: "I", title: "Games, Role-play, Storytelling & Presentations", text: "Language games, role-play, storytelling and small presentations make English something children use and enjoy, not fear." },
];

const EnglishCommunication = () => (
  <div data-testid="english-communication-page">
    <SEO
      title="English & Communication | The Study Home School, Bhojpur"
      description="Integrated English learning for primary classes: grammar, vocabulary, reading, writing, listening, speaking, storytelling and presentations — building confident English communication step by step."
    />
    <PageHero
      eyebrow="English & communication"
      title="English, Learned the Way Language Is Really Learned"
      description="Consistent practice, clear explanations, appropriate difficulty and gradual confidence-building — never pressure before a child is ready."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <Reveal>
          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-[#475569]">
            At The Study Home School, English is not treated as one subject among many. It is woven
            through the school day — in reading, in conversation, in play and in presentation —
            while Hindi and other subjects continue to receive full attention. Nine connected
            components work together to build genuine confidence.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPONENTS.map((c, i) => (
            <Reveal key={c.letter} delay={(i % 3) * 0.07}>
              <article className="card-site h-full" data-testid={`english-component-${c.letter.toLowerCase()}`}>
                <div className="w-10 h-10 rounded-xl bg-[#0756A5] text-white flex items-center justify-center font-extrabold" aria-hidden="true">{c.letter}</div>
                <h2 className="mt-4 text-base sm:text-lg font-semibold text-[#123D62]">{c.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{c.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-6 sm:p-8" data-testid="english-sample-activity">
            <div className="flex items-center gap-3">
              <BookOpen size={22} className="text-[#0756A5]" aria-hidden="true" />
              <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">A Sample Learning Activity</h2>
            </div>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#475569]">
              <em>"Market Day":</em> the classroom becomes a small market. Children take turns as
              shopkeepers and customers, practising sentences like "How much is this?", "I would
              like two apples, please" and "Thank you, here is your change." The teacher notes new
              words on the board, and children write three sentences about their market visit.
            </p>
            <p className="mt-3 text-xs text-[#64748B]">
              This is an illustrative example of the teaching style, not a fixed official syllabus.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <Link to="/admissions#enquiry-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              data-testid="english-page-enquiry-cta">
              Ask about English learning <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default EnglishCommunication;
