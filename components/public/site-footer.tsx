import Image from "next/image";
import Link from "next/link";

const footerColumns = [
  {
    title: "For importers",
    links: ["Post your shipment", "Receive private quotes", "Compare and continue"],
  },
  {
    title: "For forwarders",
    links: ["Browse shipment requests", "Send a quote", "Message after quoting"],
  },
  {
    title: "Platform",
    links: ["Private quotes", "Quote comparison", "Notifications"],
  },
];

export function PublicSiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-8 border-t border-[#e7e2dd] pt-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2" aria-label="importing.ph home">
            <Image
              src="/assets/importingph.png"
              alt="importing.ph"
              width={173}
              height={50}
              className="h-8 w-auto"
            />
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-6 text-slate-600">
            Post your shipment once, receive private quotes from cargo
            forwarders, and compare options in one organized workspace.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          {footerColumns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-[#202020]">{title}</h3>
      <ul className="mt-4 grid gap-3 text-slate-500">
        {links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  );
}
