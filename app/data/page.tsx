import Link from "next/link";
import { getDataItems } from "@/lib/api";

const categories = [
  {
    title: "Conference data",
    href: "/data/conference-data",
    desc: "Explore official conference information, event numbers, venues and annual summaries.",
    icon: "📊",
    gradient: "from-sky-500 to-blue-700",
  },
  {
    title: "Attendance statistics",
    href: "/data/attendance-statistics",
    desc: "View participant numbers, country distribution, member engagement and attendance trends.",
    icon: "👥",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    title: "Research dataset",
    href: "/data/research-dataset",
    desc: "Access curated datasets related to meetings, research themes and working group outputs.",
    icon: "🧬",
    gradient: "from-violet-500 to-indigo-700",
  },
  {
    title: "Data download",
    href: "/data/data-download",
    desc: "Download available public datasets, reports, documents and statistical resources.",
    icon: "⬇️",
    gradient: "from-orange-500 to-rose-600",
  },
];

export default async function DataPage() {
  const items = await getDataItems();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06224a] via-[#064f8f] to-[#071b34] px-6 py-20 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-300 blur-3xl" />
          <div className="absolute bottom-10 right-20 h-56 w-56 rounded-full bg-lime-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-lime-300">
            IMRWG Data Center
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Conference data, statistics and research resources
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-blue-100">
            A modern data hub for conference insights, participant statistics,
            research datasets and downloadable public resources.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-2">
        {categories.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
            <div className="p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                {item.icon}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                {item.title}
              </h2>

              <p className="mt-3 text-slate-600">{item.desc}</p>

              <div className="mt-6 font-semibold text-blue-700">
                Explore data →
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
                Latest records
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Recently published data
              </h2>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              No data has been published yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.slice(0, 6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.category}
                    </span>
                    {item.year && (
                      <span className="text-sm font-semibold text-slate-500">
                        {item.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {item.description}
                  </p>

                  {item.value && (
                    <div className="mt-4 text-2xl font-black text-blue-700">
                      {item.value}
                      {item.unit && (
                        <span className="ml-1 text-sm font-bold text-slate-500">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}