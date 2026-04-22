import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  Quote,
  FlaskConical,
  UserRound,
  PieChart,
  GitBranch,
  LayoutTemplate,
  Palette,
} from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router';

/* ─── Back-to-home pill ───────────────────────────────────────── */
function BackToHomeNav() {
  const { scrollY } = useScroll();
  const pillOpacity = useTransform(scrollY, [0, 60, 140], [0.6, 0.9, 1]);
  const pillBorder = useTransform(scrollY, [0, 140], [0.4, 1]);
  const lineWidth = useTransform(scrollY, [0, 140, 600], ['0%', '30%', '100%']);
  const arrowX = useTransform(scrollY, [0, 40, 80], [0, -2, 0]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="relative flex items-center justify-start px-4 md:px-8 py-4">
        <Link
          to="/"
          aria-label="Back to home"
          className="group pointer-events-auto relative inline-flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full transition-colors duration-500"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full backdrop-blur-xl"
            style={{
              opacity: pillOpacity,
              background:
                'linear-gradient(135deg, rgba(250,248,245,0.97) 0%, rgba(244,239,230,0.95) 50%, rgba(232,220,196,0.9) 100%)',
              boxShadow:
                '0 8px 24px -8px rgba(74,59,50,0.28), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-[#C9A678]"
            style={{ opacity: pillBorder }}
          />

          <motion.span
            aria-hidden
            className="relative z-[1] inline-flex"
            style={{ x: arrowX }}
          >
            <ArrowLeft
              size={15}
              strokeWidth={2}
              className="text-[#2C2A29] transition-transform duration-500 group-hover:-translate-x-0.5"
            />
          </motion.span>

          <span
            className="relative z-[1] text-[#2C2A29] text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ fontFamily: '"Inter", ui-sans-serif, system-ui' }}
          >
            Back to Home
          </span>

          <motion.span
            aria-hidden
            className="absolute left-4 right-5 bottom-[6px] h-px bg-gradient-to-r from-[#8B7355]/60 via-[#C9A678]/80 to-transparent"
            style={{ width: lineWidth }}
          />
        </Link>
      </div>
    </nav>
  );
}

/* ─── Shared small pieces ─────────────────────────────────────── */
const EyebrowTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.28em] uppercase text-[#8B7355]">
    <span className="w-6 h-px bg-[#C9A678]" />
    {children}
  </span>
);

const DecorRings = ({ className = '' }: { className?: string }) => (
  <svg
    aria-hidden
    className={`pointer-events-none absolute opacity-50 text-[#C9A678]/40 ${className}`}
    width="320"
    height="320"
    viewBox="0 0 320 320"
    fill="none"
  >
    <circle cx="160" cy="160" r="80" stroke="currentColor" strokeWidth="0.7" />
    <circle cx="160" cy="160" r="120" stroke="currentColor" strokeWidth="0.7" />
    <circle cx="160" cy="160" r="158" stroke="currentColor" strokeWidth="0.7" />
  </svg>
);

const ImageSlot = ({
  label,
  aspect = 'aspect-[16/9]',
  tall = false,
}: {
  label: string;
  aspect?: string;
  tall?: boolean;
}) => (
  <div
    className={`relative w-full ${aspect} bg-gradient-to-br from-[#EEE3CE] via-[#E8DCC4] to-[#DCCDAE] border border-[#C9A678]/40 flex items-center justify-center overflow-hidden ${tall ? 'rounded-sm' : ''}`}
  >
    <div
      aria-hidden
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(139,115,85,0.06) 0 2px, transparent 2px 18px)',
      }}
    />
    <div className="relative text-center px-6">
      <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#8B7355] mb-2">
        Image Placeholder
      </p>
      <p className="text-[13px] tracking-[0.14em] uppercase text-[#4A3B32] font-medium">{label}</p>
    </div>
  </div>
);

const YesNoBar = ({
  n,
  question,
  yes,
}: {
  n: number;
  question: string;
  yes: number;
}) => {
  const no = 100 - yes;
  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 font-serif text-[#C9A678] text-[13px] tabular-nums mt-0.5">
          {String(n).padStart(2, '0')}
        </span>
        <p className="text-[13px] text-[#5C5046] leading-snug">{question}</p>
      </div>
      <div className="flex items-baseline gap-6 pl-8">
        <div>
          <p
            className="text-4xl font-serif text-[#8B7355] tabular-nums leading-none"
            style={{ fontWeight: 500 }}
          >
            {yes}%
          </p>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B7355] mt-1.5">Yes</p>
        </div>
        <div>
          <p
            className="text-4xl font-serif text-[#4A3B32] tabular-nums leading-none"
            style={{ fontWeight: 500 }}
          >
            {no}%
          </p>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#5C5046] mt-1.5">No</p>
        </div>
      </div>
      <div className="mt-4 pl-8 h-[3px] w-full flex overflow-hidden rounded-full bg-[#E8DCC4]">
        <span className="h-full bg-[#8B7355]" style={{ width: `${yes}%` }} />
        <span className="h-full bg-[#C9A678]/60" style={{ width: `${no}%` }} />
      </div>
    </div>
  );
};

const QuestionChip = ({ n, text }: { n: number; text: string }) => (
  <div className="flex gap-3 items-start py-2.5 border-b border-[#E8DCC4]/70 last:border-b-0">
    <span
      className="shrink-0 font-serif text-[#C9A678] text-[13px] tabular-nums mt-0.5"
      style={{ fontWeight: 500 }}
    >
      {String(n).padStart(2, '0')}
    </span>
    <p className="text-[#5C5046] text-[14px] leading-relaxed">{text}</p>
  </div>
);

/* ─── Page ──────────────────────────────────────────────────── */
export function ThrifterProjectPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const blobAY = useTransform(scrollY, [0, 5000], [0, 800]);
  const blobBY = useTransform(scrollY, [0, 5000], [200, -900]);
  const blobCY = useTransform(scrollY, [0, 5000], [-100, 600]);

  const DISCIPLINES = [
    { icon: FlaskConical, label: 'Research' },
    { icon: UserRound, label: 'User Persona' },
    { icon: PieChart, label: 'Data Analytics' },
    { icon: GitBranch, label: 'User Flow & IA' },
    { icon: LayoutTemplate, label: 'Wireframes' },
    { icon: Palette, label: 'UI/UX Design' },
  ];

  const INTERVIEW_QUESTIONS = [
    'What motivates you to consider buying thrifted or second-hand clothing items?',
    'Can you describe your typical online shopping journey for clothing, including the websites or platforms you frequent?',
    'What factors influence your decision to purchase clothing from a particular online platform?',
    'Have you encountered any challenges or frustrations when shopping for clothing online? If so, please elaborate.',
    'How do you determine the authenticity and quality of clothes when shopping online?',
    'What features or tools do you find most helpful when searching for specific clothing items online?',
    'How often do you engage with social media or user-generated content related to fashion, and how does this influence your clothing choices?',
    'Do you value customer reviews and ratings when deciding on a clothing purchase? Why or why not?',
    'Are there any specific luxury or famous brands you are particularly interested in when shopping at discounts or sale?',
    'What would make you trust and feel more comfortable shopping for thrifted clothing on a new platform?',
    'What role does sustainability and eco-friendliness play in your clothing purchasing decisions?',
    'What concerns or reservations do you have about buying thrifted clothing, and how can they be addressed to make you feel more confident in your purchases?',
    'Would you prefer a subscription-based model for discovering new thrifted clothing items regularly? Why or why not?',
    'How important is the community aspect of thrifted clothing shopping, such as sharing style tips and experiences with other users?',
    'How do you perceive the role of technology, such as augmented reality or virtual try-ons, in enhancing your thrifted clothing shopping experience?',
  ];

  const SURVEY_DATA = [
    { q: 'Have you ever purchased thrifted clothing online or offline?', yes: 56 },
    { q: 'Do you regularly shop for fashion items on e-commerce platforms?', yes: 63 },
    { q: 'Would you be interested in buying thrifted clothing from luxury or famous brands at a lower price?', yes: 82 },
    { q: 'Do you consider sustainability and eco-friendliness when buying clothes?', yes: 16 },
    { q: 'Do you find online reviews and ratings helpful when deciding on clothing purchase?', yes: 43 },
    { q: 'Would you prefer virtual try-on options for clothing items?', yes: 60 },
    { q: 'Have you ever bought copy, replica or fake products of luxury brands?', yes: 64 },
    { q: 'If you buy a very costly dress, are you ok with wearing it in events and parties even if it feels slightly used (not damaged or washed out)?', yes: 76 },
    { q: 'Are you following some fashion influencers to follow their style?', yes: 70 },
    { q: 'Do you have certain brands that you swear by and would always wear?', yes: 59 },
  ];

  const QUAL_THEMES = [
    {
      title: 'The "Wild West" Anxiety',
      detail:
        'Buying from Instagram thrift stores reads as a gamble — inconsistent sizing, hidden damage, whimsical pricing, and no recourse when the item is not as described.',
    },
    {
      title: 'Paradox of Choice',
      detail:
        'Users want unique, one-of-a-kind items but suffer decision fatigue without strong filtering, category structure, and condition grading.',
    },
    {
      title: 'Sustainability as a Bonus',
      detail:
        'Only 16% shop primarily for sustainability. The real conversion trigger is accessible luxury; sustainability is a "feel-good" layer, not the hook.',
    },
    {
      title: 'Trust is Earned Through Proof',
      detail:
        'Authenticity badges, condition photography, and a clear returns policy are non-negotiable. Copy alone does not resolve the counterfeit fear.',
    },
  ];

  const COMPETITORS = [
    { name: 'ThredUp', role: 'Direct · US resale leader', note: 'Broad inventory, weak luxury focus' },
    { name: 'Amalfi', role: 'Direct · Luxury thrift', note: 'Closest visual benchmark' },
    { name: 'Thrifted', role: 'Direct · Niche vintage', note: 'Community-driven, poor filters' },
    { name: 'Rethought', role: 'Direct · Sustainable resale', note: 'Editorial tone, low catalog' },
    { name: 'Thrift+', role: 'Direct · UK charity resale', note: 'Strong values, cluttered UI' },
    { name: 'Etsy', role: 'Adjacent · Handmade + vintage', note: 'Discovery mechanics studied' },
    { name: 'Shoppers Stop', role: 'Benchmark · Omnichannel retail', note: 'Loyalty & returns patterns' },
    { name: 'Nykaa Fashion', role: 'Benchmark · Premium fashion', note: 'Editorial merchandising' },
    { name: 'Amazon', role: 'Benchmark · Mass e-commerce', note: 'Checkout & trust patterns' },
    { name: 'Flipkart', role: 'Benchmark · Indian e-commerce', note: 'Filtering UX reference' },
  ];

  const DATA_CUTS = [
    {
      label: 'Popular brands among luxury-brand shoppers',
      detail:
        'Aggregated order-level data to surface the luxury brands driving the majority of conversions — inputs for merchandising and featured collections.',
    },
    {
      label: 'Average discount percentage per age group',
      detail:
        'Age-banded analysis revealed Gen-Z expects deeper discounts on streetwear-adjacent luxury while Millennials tolerate smaller discounts on timeless brands.',
    },
    {
      label: 'Brands with discount percentage greater than 25%',
      detail:
        'Items priced >25% below retail showed a meaningful lift in conversion. This threshold became the default cut-off for "Deals" and email triggers.',
    },
  ];

  const EMPATHY = [
    {
      h: 'Thinking',
      b: [
        'Wants to buy luxury and famous brand products but they are generally not pocket friendly.',
        'Even if she buys a costly clothing, she will have to wear it again and again as she cannot afford multiple such products regularly.',
        'Thinks about the environmental impact of their fashion choices.',
      ],
    },
    {
      h: 'Seeing',
      b: [
        'Ads of different luxury and famous fashion brands.',
        'Influencers she follows in social media do brand promotions and she sees lots of new fashionable trends.',
        'Reviews and prices of the fashion products.',
        'Sees different shopping platforms for brand new clothing with clean and easy user interface.',
      ],
    },
    {
      h: 'Hearing',
      b: [
        'Fashion influencers, actors, models promoting new brands and trends.',
        'Instagram thrift stores selling some used or pre-loved clothing at lower price than original.',
        'Hearing about cases where fake products were sold in place of original.',
        'Sugar-coated descriptions of conditions for used clothes.',
      ],
    },
    {
      h: 'Doing & Saying',
      b: [
        'Spend time browsing through different categories and brands.',
        'Try to find discounted branded products.',
        'Wait for sale.',
        'Trying to connect with people to get pre-loved clothing.',
        'Raising awareness for environmental impact of their fashion choices.',
      ],
    },
    {
      h: 'Gains',
      b: [
        'A sense of satisfaction from contributing to sustainable fashion practices.',
        'Save money by purchasing thrifted / pre-used items at discounted prices.',
        'Finding unique and vintage pieces that are not readily available in traditional stores.',
        'Get higher quality products in a budget-friendly manner.',
        'More fashion choices leading to a better social life for young people.',
      ],
    },
    {
      h: 'Pains',
      b: [
        'Worry about the authenticity of luxury items and the verification process.',
        'Conditions not as described by seller.',
        'No proper way to quickly filter out the needs and specifications.',
        'Discontinued / traditional items not available.',
        'Influencers only suggest newer brands and products.',
        'Not budget friendly.',
        'Mass production of such fashion products lead to environmental impacts.',
      ],
    },
  ];

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#FAF8F5] text-[#2C2A29] selection:bg-[#E8DCC4] selection:text-[#2C2A29] relative overflow-hidden"
      style={{ fontFamily: '"Inter", ui-sans-serif, system-ui' }}
    >
      {/* Background Decor - scroll-linked soft blobs */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[8%] left-[-12%] w-[48vw] h-[48vw] rounded-full mix-blend-multiply opacity-40 blur-[110px] bg-[#E8DCC4]"
          style={{ y: blobAY }}
        />
        <motion.div
          className="absolute top-[44%] right-[-8%] w-[42vw] h-[42vw] rounded-full mix-blend-multiply opacity-30 blur-[110px] bg-[#D4C3A3]"
          style={{ y: blobBY }}
        />
        <motion.div
          className="absolute top-[75%] left-[10%] w-[38vw] h-[38vw] rounded-full mix-blend-multiply opacity-25 blur-[110px] bg-[#F2E6CF]"
          style={{ y: blobCY }}
        />
      </div>

      <BackToHomeNav />

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 pt-28 md:pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <DecorRings className="-top-10 -left-24 md:-left-16 w-[320px] md:w-[420px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center"
        >
          <div>
            <p className="text-[11px] font-medium tracking-[0.32em] uppercase text-[#8B7355] mb-8">
              Abhiroop Chaudhuri
            </p>
            <h1
              className="font-serif text-[#2C2A29] leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(56px, 10vw, 140px)' }}
            >
              Thrifter<span className="text-[#C9A678]">.</span>
            </h1>
            <p className="font-serif italic text-2xl md:text-[28px] text-[#4A3B32] mb-8 leading-tight">
              Thrift Like a Pro, Dress Like a Star<span className="text-[#C9A678]">.</span>
            </p>
            <p className="text-[17px] text-[#5C5046] leading-relaxed max-w-xl mb-10">
              E-commerce platform for{' '}
              <span className="font-semibold text-[#4A3B32]">Thrifted Fashion Products</span> —
              Case Study
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-4">
              {DISCIPLINES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[#5C5046]">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#E8DCC4] border border-[#C9A678]/40">
                    <Icon size={14} className="text-[#8B7355]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[13px] font-medium text-[#4A3B32]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ImageSlot label="Cover Mockup · Final UI Compilation" aspect="aspect-[4/3]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Product Overview ─────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <EyebrowTag>Product Overview</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight">
              Product Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
            <p className="text-[17px] text-[#5C5046] leading-[1.85] text-justify">
              Thrifter is a dynamic e-commerce platform revolutionizing the way people shop for
              fashion. Specializing in thrifted clothing from renowned luxury brands, Thrifter offers
              customers access to high-quality, affordable fashion treasures. Discover a curated
              selection of pre-loved clothing, spanning from classic to contemporary styles, all at
              budget-friendly prices. With Thrifter, fashion enthusiasts can embrace sustainability
              without compromising on style. You can find your favourite fashion products according
              to the condition, year, price etc. The products are verified by Thrifter Platform so
              you can be assured of the quality and condition. Also returns, delivery etc are
              handled by the platform itself just like other e-commerce platforms like Amazon,
              Flipkart etc so you don&apos;t need to worry.
            </p>
            <ImageSlot label="Product Overview · Search & Listing Screens" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* ─── The Problem ──────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center relative">
          <DecorRings className="-top-16 -left-32 w-[320px] hidden md:block" />
          <EyebrowTag>01 · The Problem</EyebrowTag>
          <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight">
            The Problem
          </h2>
          <p className="mt-8 text-[17px] text-[#5C5046] leading-[1.9] text-center">
            In the traditional e-commerce landscape, customers often face limited access to
            affordable luxury and branded clothing. Many luxury brands and companies release their
            products in very limited quantity and then these are arranged mainly for specific
            distributors. This results in missed opportunities for individuals seeking high-quality
            fashion items at budget-friendly prices. Also even if they want to buy thrifted clothing
            or products, they are forced to pay whatever prices the owners demand as there are no
            immediate competition or benchmark. For sellers, they don&apos;t have any certainty of
            when they can find a next buyer so they try to overshoot prices as well. Thrifter was
            needed to address this issue by creating a dedicated platform for thrifted clothing from
            famous and luxury brands. Its mission is to bridge the gap between exclusive fashion and
            affordability, catering to users who desire sustainable, stylish options while saving
            money.
          </p>
        </div>
      </section>

      {/* ─── The Goal ─────────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <EyebrowTag>02 · The Goal</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-8">
              The Goal
            </h2>
            <p className="text-[17px] text-[#5C5046] leading-[1.9] text-justify">
              The goal is to make thrifting as simple as buying products from other E-commerce
              platforms like Amazon, Flipkart etc. This platform will have multiple thrifted
              products with different conditions, prices, colors, sizes etc. They will be delivered
              and verified by Thrifter which will also provide all necessary support like returns
              etc. The experience must be similar to what the customers are accustomed to but should
              greatly incorporate the features of thrifting to make it less of an alien experience.
              As the thrifted products are not always available in all sizes and colors, and the
              conditions are not same, proper filtering methods with exact sorting according to
              condition is also needed. The ultimate goal is to make all the luxury products
              available in a single place for thrifting so customers do not need to wander to
              different sellers thus increasing availability, competition and trust in the process
              of owning pre-loved clothing.
            </p>
          </div>
          <ImageSlot label="Illustration · The Thrifter Persona" aspect="aspect-[3/4]" tall />
        </div>
      </section>

      {/* ─── Qualitative Analysis ─────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <EyebrowTag>03 · Research</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Qualitative Analysis
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              I interviewed 45–50 people from diverse and different backgrounds, age groups,
              financial situations, professions, gender and states. I tried to include tech-savvy
              people as well as people who rarely use online shopping platforms themselves and
              prefer traditional stores and malls to buy clothes. I asked them some of these
              following questions for qualitative analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#8B7355] mb-4">
                Interview Protocol · 15 questions
              </p>
              <div className="border-t border-b border-[#E8DCC4] py-2">
                {INTERVIEW_QUESTIONS.map((q, i) => (
                  <QuestionChip key={i} n={i + 1} text={q} />
                ))}
              </div>
            </div>
            <div className="space-y-6 lg:sticky lg:top-20">
              <ImageSlot label="Illustration · Interview Insights" aspect="aspect-[4/5]" tall />
              <div className="bg-[#E8DCC4]/50 border-l-2 border-[#8B7355] px-6 py-5 relative">
                <Quote className="absolute -top-3 left-4 w-6 h-6 text-[#8B7355]/60" />
                <p className="font-serif italic text-[17px] text-[#4A3B32] leading-relaxed">
                  &ldquo;I love the idea of second-hand fashion, but I need a platform that not only
                  offers great deals but also ensures the quality of the items I purchase.&rdquo;
                </p>
                <p className="mt-3 text-[11px] tracking-[0.22em] uppercase text-[#8B7355]">
                  A recurring voice across 45 interviews
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUAL_THEMES.map((t, i) => (
              <div
                key={t.title}
                className="relative border border-[#E8DCC4] bg-[#FAF8F5]/80 backdrop-blur-sm p-6"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#8B7355]"
                />
                <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A678] mb-2 tabular-nums">
                  Theme {String(i + 1).padStart(2, '0')}
                </p>
                <h4 className="text-[20px] font-serif text-[#4A3B32] mb-2 leading-snug">
                  {t.title}
                </h4>
                <p className="text-[#5C5046] text-[14px] leading-relaxed">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quantitative Analysis ────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12 bg-[#F4EFE6]/80 backdrop-blur-sm border-y border-[#E8DCC4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>Quantitative</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Quantitative Analysis
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              Alongside deep interviews, I ran a structured 10-question survey to size each signal.
              The biggest takeaway: appetite for luxury thrift is strong, but trust is the gating
              factor — 64% have already been burned by counterfeits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
            {SURVEY_DATA.map((s, i) => (
              <YesNoBar key={i} n={i + 1} question={s.q} yes={s.yes} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Competitive Analysis ─────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>04 · Benchmarking</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Competitive Analysis
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              As there are not many such E-commerce platforms which allow to list thrifted products,
              I did a competitive analysis of the existing ones and other e-commerce platforms too,
              especially in the fashion domain and platforms which allow users to sell second-hand
              products P2P. Some of the platforms which were analyzed are listed below.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {COMPETITORS.map((c) => (
              <div
                key={c.name}
                className="border border-[#E8DCC4] bg-[#FAF8F5] p-5 flex flex-col justify-between"
              >
                <div>
                  <p className="text-[16px] font-serif text-[#2C2A29] mb-1">{c.name}</p>
                  <p className="text-[9.5px] tracking-[0.24em] uppercase text-[#C9A678] mb-3">
                    {c.role}
                  </p>
                </div>
                <p className="text-[12.5px] text-[#5C5046] leading-snug">{c.note}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[13px] text-[#8B7355] italic">
            Heuristic finding: existing thrift platforms read as visually &ldquo;cheap&rdquo; — to
            sell luxury, the UI itself has to read as luxury.
          </p>
        </div>
      </section>

      {/* ─── Data Analysis ────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>05 · Data</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Data Analysis
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              Some datasets were provided by the company which were related to brands and their
              sales, customers of different age groups and what they shop online, which brands have
              higher availability etc. Although the data sets are gathered from multiple sources and
              is not 100% accurate representation, analysis of these can help us reach a good
              understanding of the market and how people may interact with thrifted products. As the
              data is confidential, I will not be sharing those, but just the general approach on
              how we can analyze such data to reach some conclusions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {DATA_CUTS.map((d, i) => (
              <div
                key={d.label}
                className="border border-[#E8DCC4] bg-[#FAF8F5] overflow-hidden"
              >
                <div className="relative bg-[#1F1C1B] aspect-[16/10] flex items-center justify-center overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        'linear-gradient(#2C2726 1px, transparent 1px), linear-gradient(90deg, #2C2726 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                    }}
                  />
                  <span className="relative text-[#C9A678]/80 font-mono text-[11px] tracking-[0.3em] uppercase">
                    Confidential
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#C9A678] mb-2 tabular-nums">
                    Cut {String(i + 1).padStart(2, '0')}
                  </p>
                  <h4 className="text-[16px] font-serif text-[#2C2A29] mb-2 leading-snug">
                    {d.label}
                  </h4>
                  <p className="text-[#5C5046] text-[13.5px] leading-relaxed">{d.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── User Persona ─────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12 bg-[#F4EFE6]/80 backdrop-blur-sm border-y border-[#E8DCC4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <EyebrowTag>06 · Synthesis</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight">
              User Persona
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_2fr] gap-10 lg:gap-14 items-start">
            <div className="space-y-6">
              <ImageSlot label="Persona Portrait · Sneha Pathak" aspect="aspect-[3/4]" tall />
              <div>
                <p className="font-serif text-2xl text-[#2C2A29] mb-3">Sneha Pathak</p>
                <dl className="space-y-1.5 text-[14px] text-[#5C5046]">
                  <div className="flex gap-2">
                    <dt className="font-semibold text-[#4A3B32]">Age:</dt>
                    <dd>19</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-[#4A3B32]">Profession / Education:</dt>
                    <dd>B.Com Student</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-[#4A3B32]">Location:</dt>
                    <dd>New Delhi</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-[#FAF8F5] border border-[#E8DCC4] p-6 relative">
                <Quote className="absolute -top-3 left-5 w-6 h-6 text-[#8B7355]/70" />
                <p className="font-serif italic text-[18px] text-[#4A3B32] leading-relaxed">
                  &ldquo;I love the idea of second-hand fashion, but I need a platform that not only
                  offers great deals but also ensures the quality of the items I purchase.&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#E8DCC4]/60 p-6 border border-[#C9A678]/30">
                  <p className="font-serif text-xl text-[#2C2A29] mb-4 text-center">Goals</p>
                  <ul className="space-y-2.5 text-[14px] text-[#5C5046] leading-relaxed">
                    <li>
                      • To purchase thrifted clothing items from popular and luxury brands while
                      reducing load on her wallet.
                    </li>
                    <li>
                      • To ensure that the thrifted items she purchases are in good condition, free
                      from significant wear and tear.
                    </li>
                    <li>
                      • Wants seamless and user-friendly online shopping experience with intuitive
                      navigation, clear categorization, and a straightforward checkout process.
                    </li>
                  </ul>
                </div>
                <div className="bg-[#E8DCC4]/60 p-6 border border-[#C9A678]/30">
                  <p className="font-serif text-xl text-[#2C2A29] mb-4 text-center">Challenges</p>
                  <ul className="space-y-2.5 text-[14px] text-[#5C5046] leading-relaxed">
                    <li>• Concerns about the authenticity of thrifted luxury items.</li>
                    <li>
                      • Most Instagram thrifters and websites don&apos;t provide proper filtering
                      and categorization.
                    </li>
                    <li>
                      • She may stumble upon sellers for a particular products, due to no
                      competition, the prices are often whimsical.
                    </li>
                    <li>
                      • The conditions are often not described properly leading to unsatisfied
                      expectations.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#E8DCC4]/60 p-6 border border-[#C9A678]/30">
                <p className="text-[14px] text-[#5C5046] leading-relaxed">
                  Sneha is a fashion-conscious college girl with a deep passion for sustainability
                  and ethical consumption. She has been an advocate for eco-friendly practices and
                  has actively participated in various recycling and thrift shopping events.
                  She&apos;s an urban dweller, residing in New Delhi, and always on the lookout for
                  unique, sustainable fashion finds and follows influencers for trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Empathy Mapping ──────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <EyebrowTag>07 · Empathy</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight">
              Empathy Mapping
            </h2>
            <p className="mt-5 text-[#5C5046] text-[16px] max-w-2xl mx-auto leading-[1.8]">
              A six-quadrant view of what Sneha is thinking, seeing, hearing, doing, gaining and
              losing — used as the emotional anchor for every subsequent design decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EMPATHY.map((e, idx) => (
              <div
                key={e.h}
                className="bg-[#E8DCC4]/60 border border-[#C9A678]/30 p-6 flex flex-col"
              >
                <p className="text-[10px] tracking-[0.28em] uppercase text-[#C9A678] mb-1 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <h4 className="font-serif text-xl text-[#2C2A29] mb-4">{e.h}</h4>
                <ul className="space-y-2 text-[13.5px] text-[#5C5046] leading-relaxed">
                  {e.b.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── User Flow & Architecture ─────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>08 · Architecture</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              User Flow &amp; Architecture
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              A flowchart mapping Landing Page → Categories / Search → Product Details → Cart →
              Payment → Confirmation, including Account and Profile flows. Trust signals —
              &ldquo;Verified Authentic&rdquo; and condition grading — surface at every decision
              point, not just at checkout.
            </p>
          </div>
          <ImageSlot label="Flow Diagram · Discovery → Checkout → Post-purchase" aspect="aspect-[16/11]" />
        </div>
      </section>

      {/* ─── Components ───────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12 bg-[#F4EFE6]/80 backdrop-blur-sm border-y border-[#E8DCC4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>09 · Design System</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Components
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              A modular component library — nav bars, filter panels, product cards, form inputs,
              CTAs, pagination, collection strips — built for a mobile-first catalog and tuned to a
              warm, editorial palette that elevates pre-loved pieces to new-season gravitas.
            </p>
          </div>
          <ImageSlot label="Component Library · Atoms, molecules, product cards" aspect="aspect-[16/7]" />
        </div>
      </section>

      {/* ─── Low-Fidelity Wireframes ──────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>10 · Wireframes</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Low-Fidelity Wireframes
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              Structural wireframes covering the landing page, product listing, product detail,
              collections, cart and checkout — iterated to maximize product visibility and ensure
              filtering remains intuitive on mobile.
            </p>
          </div>
          <ImageSlot label="Wireframes · Home, PLP, PDP, Checkout, Profile" aspect="aspect-[16/11]" />
        </div>
      </section>

      {/* ─── Final Designs ────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12 bg-[#F4EFE6]/80 backdrop-blur-sm border-y border-[#E8DCC4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>11 · High-Fidelity</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              Final Designs
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              High-fidelity screens across the buyer journey — landing, product search, product
              detail, collections, other pages — responsive across desktop and mobile.
            </p>
          </div>
          <ImageSlot label="Final UI · Full responsive screen set" aspect="aspect-[16/13]" />
        </div>
      </section>

      {/* ─── AI Heat Maps & Focus Maps ────────────────────── */}
      <section className="relative z-10 py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <EyebrowTag>12 · Validation</EyebrowTag>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl text-[#2C2A29] leading-tight mb-6">
              AI Heat Maps and Focus Maps (Pre-Launch)
            </h2>
            <p className="text-[#5C5046] text-[16px] leading-[1.8]">
              After designing, it is not always possible to find people to conduct tests for Heat
              Maps and Focus Maps — especially when on a tight deadline. Even if there is a
              possibility to conduct tests, it&apos;s better to leverage AI to analyze the designs
              and create Heat Maps. We can also analyze our competitors to find out which elements
              and structure is working best for them or where we stand when compared to them. Here I
              have uploaded some screenshots of AI-generated Heat Maps and Focus Maps of my Product
              Page design and have compared to one of the leading E-commerce platforms in the world.
            </p>
          </div>

          {/* Thrifter desktop */}
          <div className="mb-12">
            <p className="text-center text-[11px] tracking-[0.28em] uppercase text-[#8B7355] mb-6">
              Thrifter&apos;s Product Page · Heat-map and Focus-map
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
              <ImageSlot label="Thrifter PDP · Heat-map" aspect="aspect-[16/9]" />
              <div className="flex flex-col gap-4">
                <ImageSlot label="Thrifter PDP · Focus-map" aspect="aspect-[4/3]" />
                <div className="bg-[#FAF8F5] border border-[#E8DCC4] p-5 text-center">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#8B7355] mb-2">
                    Optimal Clarity
                  </p>
                  <p className="font-serif text-5xl text-[#2C2A29] tabular-nums">67</p>
                  <p className="text-[12px] text-[#5C5046] mt-2 leading-snug">
                    You have a great clarity than 60% of the most popular websites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Leading e-commerce desktop */}
          <div className="mb-12">
            <p className="text-center text-[11px] tracking-[0.28em] uppercase text-[#8B7355] mb-6">
              Leading E-commerce Platform&apos;s Product Page · Heat-map and Focus-map
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
              <ImageSlot label="Competitor PDP · Heat-map" aspect="aspect-[16/9]" />
              <div className="flex flex-col gap-4">
                <ImageSlot label="Competitor PDP · Focus-map" aspect="aspect-[4/3]" />
                <div className="bg-[#FAF8F5] border border-[#E8DCC4] p-5 text-center">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#8B7355] mb-2">
                    Moderate Difficulty
                  </p>
                  <p className="font-serif text-5xl text-[#C9A678] tabular-nums">48</p>
                  <p className="text-[12px] text-[#5C5046] mt-2 leading-snug">
                    You need more than 60% of the most popular websites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile comparison */}
          <div>
            <p className="text-center text-[11px] tracking-[0.28em] uppercase text-[#8B7355] mb-6">
              Mobile Design&apos;s Heat-maps of Thrifter and Leading E-commerce Platform&apos;s
              Product Page
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col gap-4 items-center">
                <ImageSlot label="Thrifter Mobile · Heat-map" aspect="aspect-[9/16]" tall />
                <div className="bg-[#FAF8F5] border border-[#E8DCC4] p-4 text-center w-full">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#8B7355] mb-1">
                    Optimal Clarity
                  </p>
                  <p className="font-serif text-4xl text-[#2C2A29] tabular-nums">58</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <ImageSlot label="Competitor Mobile · Heat-map" aspect="aspect-[9/16]" tall />
                <div className="bg-[#FAF8F5] border border-[#E8DCC4] p-4 text-center w-full">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-[#8B7355] mb-1">
                    Moderate Difficulty
                  </p>
                  <p className="font-serif text-4xl text-[#C9A678] tabular-nums">57</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[#5C5046] text-[15px] max-w-3xl mx-auto leading-relaxed">
            Attention concentrated where we intended — the hero product image, price anchor, and
            the primary &ldquo;Add to Cart&rdquo; CTA — confirming a high-converting layout prior to
            development sign-off.
          </p>
        </div>
      </section>

      {/* ─── Thank You ────────────────────────────────────── */}
      <section className="relative z-10 py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center relative">
          <DecorRings className="-top-12 -left-16 w-[320px] hidden md:block" />
          <h2
            className="font-serif text-[#2C2A29] leading-[0.95]"
            style={{ fontSize: 'clamp(56px, 9vw, 120px)' }}
          >
            Thank You<span className="text-[#C9A678]">.</span>
          </h2>
          <p className="mt-8 text-[13px] tracking-[0.32em] uppercase text-[#8B7355]">made with</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            {['Figma', 'Photoshop', 'Illustrator'].map((tool) => (
              <div
                key={tool}
                className="flex flex-col items-center gap-2"
                title={tool}
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DCC4] shadow-[0_4px_12px_-4px_rgba(74,59,50,0.12)] flex items-center justify-center">
                  <span className="font-serif text-[#8B7355] text-[15px]">
                    {tool.charAt(0)}
                  </span>
                </div>
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#8B7355]">
                  {tool}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 py-10 border-t border-[#E8DCC4] text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#8B7355]">
          Thrifter · Case Study · Abhiroop Chaudhuri
        </p>
      </footer>
    </div>
  );
}
