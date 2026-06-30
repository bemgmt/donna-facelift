import Link from "next/link"
import { ArrowRight, FolderArchive, PlayCircle, ShieldCheck, Sparkles } from "lucide-react"

const modes = [
  {
    href: "/investor",
    title: "Investor Preview",
    description:
      "A self-contained DONNA demo suite with local sandbox data for diligence, DIN, the data room, and core workflows.",
    cta: "Enter preview",
    icon: Sparkles,
    bullets: ["No login required", "Static fixtures", "Local sandbox actions"],
  },
  {
    href: "/drive",
    title: "DONNA Drive",
    description:
      "A facilitator-led live event simulation backed by Drive event state, role assignments, scenario controls, and summaries.",
    cta: "Open Drive",
    icon: PlayCircle,
    bullets: ["Live event flow", "Scenario packs", "Facilitator controls"],
  },
]

export default function ModeChooserPage() {
  return (
    <div className="min-h-screen text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Two supported DONNA modes
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Choose how to experience DONNA
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
            Investor Preview is local and static. DONNA Drive is the Supabase-backed event simulation.
            The legacy production app path is no longer the default experience.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className="group rounded-lg border border-white/12 bg-white/[0.045] p-6 transition-colors hover:border-white/24 hover:bg-white/[0.075]"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-black/25">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white/70" />
                </div>
                <h2 className="text-2xl font-medium text-white">{mode.title}</h2>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-white/58">{mode.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {mode.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
                <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                  {mode.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )
          })}
        </div>

        <Link
          href="/investor/data-room"
          className="mt-6 inline-flex w-fit items-center gap-2 text-sm text-white/50 hover:text-white/80"
        >
          <FolderArchive className="h-4 w-4" />
          Open investor data room directly
        </Link>
      </section>
    </div>
  )
}
