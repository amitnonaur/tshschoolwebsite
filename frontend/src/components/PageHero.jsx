import { Reveal } from "./Reveal";

const PageHero = ({ eyebrow, title, description }) => (
  <section className="bg-[#123D62] text-white" data-testid="page-hero">
    <div className="container-site py-14 sm:py-20">
      <Reveal>
        {eyebrow && <p className="eyebrow !text-[#7FB4E3] mb-3">{eyebrow}</p>}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#C9D9E8] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </Reveal>
    </div>
  </section>
);

export default PageHero;
