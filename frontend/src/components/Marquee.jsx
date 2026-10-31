const ITEMS = [
  "Strong Academics",
  "Confident English",
  "Computer Education",
  "Learning by Doing",
  "Sports & Well-being",
  "Knowledge with Character",
];

const Row = () => (
  <div className="flex items-center shrink-0">
    {ITEMS.map((item) => (
      <span key={item} className="flex items-center text-sm sm:text-base font-semibold tracking-wide text-[#123D62]">
        <span className="px-6 sm:px-10 whitespace-nowrap">{item}</span>
        <span className="text-[#D97706] text-lg" aria-hidden="true">✦</span>
      </span>
    ))}
  </div>
);

const Marquee = () => (
  <div
    className="bg-[#EAF0F8] border-y border-[#D8E3F0] py-4 overflow-hidden"
    aria-label="School focus areas"
    data-testid="editorial-marquee"
  >
    <div className="marquee-track">
      <Row />
      <Row />
    </div>
  </div>
);

export default Marquee;
