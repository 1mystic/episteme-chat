'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-grotesk tracking-[0.22em] uppercase mb-5"
      style={{ fontSize: '11px', color: '#FFB000' }}
    >
      {children}
    </p>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-grotesk font-semibold mb-10 leading-tight"
      style={{ fontSize: 'clamp(26px, 4vw, 46px)', color: '#eee0d0', letterSpacing: '-0.03em' }}
    >
      {children}
    </h2>
  )
}

function Divider() {
  return (
    <div
      className="w-full my-20"
      style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }}
    />
  )
}

export default function VisionPage() {
  return (
    <main className="min-h-screen relative" style={{ background: '#08090A', color: '#eee0d0' }}>
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        style={{ zIndex: 0 }}
      />

      {/* Ambient radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,176,0,0.05) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />

      {/* Back link */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-16 pt-10 pb-0">
        <Link
          href="/"
          className="font-grotesk tracking-[0.18em] uppercase transition-opacity hover:opacity-70 flex items-center gap-1.5"
          style={{ fontSize: '12px', color: '#FFB000' }}
        >
          <ArrowLeft size={13} /> EPISTEME
        </Link>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-32">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-0"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// THE EPISTEME MANIFESTO</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-grotesk font-semibold leading-tight mb-8"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#eee0d0', letterSpacing: '-0.035em' }}
          >
            &ldquo;In 2026, every student has access to AI.{' '}
            <span style={{ color: '#FFB000' }}>Almost none of them are learning.</span>&rdquo;
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-grotesk leading-relaxed"
            style={{ fontSize: 'clamp(17px, 2vw, 21px)', color: '#d7c4ac', maxWidth: '760px', lineHeight: 1.7 }}
          >
            The problem isn&apos;t access to information. It&apos;s the absence of someone who will ask:{' '}
            <em style={{ color: '#eee0d0' }}>but why do you think that?</em>
          </motion.p>
        </motion.section>

        <Divider />

        {/* ── The problem ────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// THE PROBLEM</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionTitle>What AI got wrong about learning</SectionTitle>
          </motion.div>

          {[
            `Every AI tool built in the last three years has been optimising for the same thing: user satisfaction. Faster answers. Better formatting. More confident tone. The feedback loop is: question → instant answer → dopamine → next question. This loop is catastrophically good at one thing: making people feel informed while systematically destroying their ability to reason.`,
            `The students being failed most are not in elite institutions. They are the 50 million in Tier-2 and Tier-3 cities across India, Southeast Asia, and Latin America — people who have internet access but no mentor, no Socratic dialogue, no teacher who will sit with them in their confusion and ask 'what do you already know?' They have access to every answer. No one has given them a framework to evaluate any of it.`,
            `At IIT Madras, this is visible in both directions. Students in the data science program copy notebook outputs without understanding what the model is doing. Interviewers consistently report the same thing: 'They know the algorithms. They cannot reason about when to use them, or why they fail.' This is not an intelligence gap. It is a cognitive scaffolding gap. And no tool in 2026 addresses it.`,
          ].map((para, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              className="font-grotesk leading-[1.85] mb-8"
              style={{ fontSize: '17px', color: '#d7c4ac', lineHeight: 1.85 }}
            >
              {para}
            </motion.p>
          ))}
        </motion.section>

        <Divider />

        {/* ── The answer ─────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// THE ANSWER</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionTitle>The anti-answer machine</SectionTitle>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-grotesk leading-[1.85] mb-12"
            style={{ fontSize: '17px', color: '#d7c4ac', lineHeight: 1.85 }}
          >
            Episteme is philosophically built around a single constraint:{' '}
            <strong style={{ color: '#eee0d0', fontWeight: 600 }}>refuse to answer</strong>. Not as
            a gimmick — as a pedagogical commitment grounded in 2,400 years of evidence that the
            Socratic method builds deeper, more durable understanding than direct instruction.
          </motion.p>

          <motion.blockquote
            variants={fadeUp}
            className="font-grotesk font-medium text-center my-14 px-4 md:px-16"
            style={{ fontSize: 'clamp(20px, 3vw, 34px)', color: '#FFB000', lineHeight: 1.5, letterSpacing: '-0.02em' }}
          >
            &ldquo;The goal is not to teach. The goal is to make the student teach themselves — and
            to build a system that makes that process inevitable.&rdquo;
          </motion.blockquote>

          <motion.p
            variants={fadeUp}
            className="font-grotesk leading-[1.85]"
            style={{ fontSize: '17px', color: '#d7c4ac', lineHeight: 1.85 }}
          >
            Practically, this means every Episteme session runs a formal 7-state dialogue machine.
            It means every user response is scored not just for correctness but for reasoning
            quality, uncertainty signals, and technical vocabulary density. It means misconceptions
            are detected and addressed specifically, not hoped away. It means the system tracks not
            just what you got right — but what you haven&apos;t thought to ask yet.
          </motion.p>
        </motion.section>

        <Divider />

        {/* ── Differentiators table ──────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// COMPETITIVE LANDSCAPE</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionTitle>Why Episteme is not another AI tutor</SectionTitle>
          </motion.div>

          <motion.div variants={fadeUp} className="w-full overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FFB000' }}>
                  {['Competitor', 'What they optimise for', 'What Episteme does instead'].map((h) => (
                    <th
                      key={h}
                      className="font-grotesk text-left py-4 px-5"
                      style={{ fontSize: '11px', color: '#FFB000', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#191209' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Claude.ai / ChatGPT', 'Answering questions completely', 'Refuses to answer — probes first'],
                  ['Khan Academy AI', 'Explaining concepts clearly', 'Socratic dialogue, not explanation'],
                  ['Duolingo', 'Gamified repetition and recall', 'Depth-first understanding'],
                  ['Coursera AI', 'Supplementing course content', 'Works on any question, any domain'],
                  ['Perplexity', 'Research speed', 'Anti-answer by philosophical design'],
                  ['Human tutors', 'Expensive, inaccessible', 'Democratised, asynchronous, scalable'],
                ].map(([competitor, them, us], i) => (
                  <CompetitorRow key={i} competitor={competitor} them={them} us={us} />
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Ethics ─────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// ETHICAL DESIGN PRINCIPLES</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionTitle>Design that refuses to harm</SectionTitle>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EthicsCard
              number="01"
              title="The Frustration Trap"
              body="Users who are confused don't need more questions. Episteme detects lost state after 2 consecutive low-quality responses and shifts into SCAFFOLD mode — providing a minimal conceptual foothold before resuming Socratic dialogue."
            />
            <EthicsCard
              number="02"
              title="Bias in Depth Scoring"
              body="Clarity scores are growth trajectories, not grades. They are never shown as a judgment on the user's intelligence — only as a map of how understanding has developed over this conversation."
            />
            <EthicsCard
              number="03"
              title="Cultural Epistemic Bias"
              body="The Socratic method is Western-rooted. Episteme acknowledges this explicitly. Users can switch to Direct Explanation mode at any time. Socratic mode is an offer, not an imposition."
            />
            <EthicsCard
              number="04"
              title="The Dependency Paradox"
              body="The tool's stated goal is to make itself unnecessary. We track 'independent reasoning streaks' — moments when the user answers their own question before Episteme asks. These are surfaced as the highest-value moments of a session."
            />
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Roadmap ────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// ROADMAP</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionTitle>Where this goes</SectionTitle>
          </motion.div>

          <motion.div variants={staggerContainer} className="flex flex-col gap-3">
            {[
              {
                version: 'V1.1',
                title: 'Personalized Learning Paths',
                timeline: 'Post-hackathon',
                body: 'The knowledge map becomes a curriculum. Based on insight cards and detected gaps, Episteme generates a 30-day Socratic study plan. The plan updates as understanding deepens.',
              },
              {
                version: 'V1.2',
                title: 'Teacher Dashboard',
                timeline: '3 months',
                body: 'Educators upload a syllabus. Episteme auto-generates Socratic question trees for each topic. Teachers see class-wide clarity heatmaps — understanding at scale, not just grades.',
              },
              {
                version: 'V1.3',
                title: 'Vernacular Support',
                timeline: '6 months',
                body: 'Hindi, Tamil, Bengali, Bahasa — Socratic dialogue in regional languages. This is the actual unlock for Tier-2/3 India. The reasoning capacity gap is not linguistic. The tools have been.',
              },
            ].map((item) => (
              <motion.div key={item.version} variants={fadeUp}>
                <RoadmapItem {...item} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <Divider />

        {/* ── Closing ────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center"
        >
          <motion.p
            variants={fadeUp}
            className="font-grotesk font-medium leading-snug mx-auto mb-14"
            style={{ fontSize: 'clamp(20px, 3.5vw, 36px)', color: '#eee0d0', maxWidth: '800px', letterSpacing: '-0.025em' }}
          >
            &ldquo;Every AI in 2026 is optimising for user satisfaction. We are optimising for user
            growth. These are not the same thing.{' '}
            <span style={{ color: '#FFB000' }}>The gap between them is the entire product.</span>&rdquo;
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/"
              className="font-grotesk font-semibold tracking-[0.16em] uppercase transition-all hover:opacity-90 active:scale-95 flex items-center gap-2"
              style={{
                fontSize: '12px',
                padding: '15px 36px',
                background: '#FFB000',
                color: '#08090A',
                boxShadow: '0 0 28px rgba(255,176,0,0.35)',
                display: 'inline-flex',
              }}
            >
              Start a session <ArrowRight size={13} />
            </Link>

            <Link
              href="/about"
              className="font-grotesk font-medium tracking-[0.14em] uppercase transition-all hover:text-[#eee0d0] active:scale-95 flex items-center gap-2"
              style={{
                fontSize: '12px',
                padding: '14px 36px',
                background: 'transparent',
                color: '#d7c4ac',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex',
              }}
            >
              Read the architecture <ArrowRight size={13} />
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompetitorRow({ competitor, them, us }: { competitor: string; them: string; us: string }) {
  return (
    <tr className="group transition-colors duration-150" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <td className="font-grotesk py-4 px-5 transition-colors duration-150 group-hover:bg-[#191209]" style={{ fontSize: '15px', color: '#eee0d0', background: '#08090A' }}>
        {competitor}
      </td>
      <td className="font-grotesk py-4 px-5 transition-colors duration-150 group-hover:bg-[#191209]" style={{ fontSize: '15px', color: '#9f8e78', background: '#08090A' }}>
        {them}
      </td>
      <td className="font-grotesk py-4 px-5 transition-colors duration-150 group-hover:bg-[#191209]" style={{ fontSize: '15px', color: '#FFB000', background: '#08090A' }}>
        {us}
      </td>
    </tr>
  )
}

function EthicsCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div
      className="p-7 transition-colors duration-200"
      style={{
        background: '#191209',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="font-grotesk font-semibold shrink-0 mt-[3px]" style={{ fontSize: '12px', color: '#FFB000', letterSpacing: '0.12em' }}>
          {number}
        </span>
        <h3 className="font-grotesk font-semibold" style={{ fontSize: '18px', color: '#eee0d0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
      </div>
      <p className="font-grotesk leading-relaxed" style={{ fontSize: '15px', color: '#d7c4ac', paddingLeft: '2.5rem', lineHeight: 1.7 }}>
        {body}
      </p>
    </div>
  )
}

function RoadmapItem({ version, title, timeline, body }: { version: string; title: string; timeline: string; body: string }) {
  return (
    <div
      className="flex flex-col sm:flex-row gap-6 p-7"
      style={{
        background: '#191209',
        border: '1px solid rgba(255,255,255,0.10)',
        borderLeft: '2px solid #FFB000',
      }}
    >
      <div className="shrink-0 sm:w-36">
        <span className="font-grotesk font-semibold block mb-1" style={{ fontSize: '15px', color: '#FFB000', letterSpacing: '0.06em' }}>
          {version}
        </span>
        <span className="font-grotesk block" style={{ fontSize: '11px', color: '#9f8e78', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {timeline}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-grotesk font-semibold mb-2" style={{ fontSize: '18px', color: '#eee0d0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p className="font-grotesk leading-relaxed" style={{ fontSize: '15px', color: '#d7c4ac', lineHeight: 1.7 }}>
          {body}
        </p>
      </div>
    </div>
  )
}
