"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const designPages = [
  { href: "/design/site-portfolio", label: "Site & Portfolio" },
  { href: "/design/business-case", label: "Business Case" },
  { href: "/design/one-pager", label: "Client One-Pager" },
  { href: "/design/pathway-comparison", label: "Pathway Comparison" },
];

const operationsPages = [
  { href: "/operations/live", label: "Live Operations" },
  { href: "/operations/scenarios", label: "Scenario Studio" },
  { href: "/operations/insights", label: "Insights" },
];

export function Nav() {
  const pathname = usePathname();
  const isDesign = pathname.startsWith("/design");
  const pages = isDesign ? designPages : operationsPages;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print">
      {/* Top bar */}
      <div className="bg-navy-card border-b border-navy-border px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-accent/10 p-1.5 rounded-md">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              DER Portfolio Platform
            </p>
            <p className="text-gray-500 text-xs">
              Santa Clara Hyperscale Facility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-navy rounded-lg p-1 border border-navy-border">
          <Link href="/design/site-portfolio">
            <span
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer block ${
                isDesign
                  ? "bg-accent text-navy shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Design Mode
            </span>
          </Link>
          <Link href="/operations/live">
            <span
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer block ${
                !isDesign
                  ? "bg-accent text-navy shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Operations Mode
            </span>
          </Link>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="bg-navy border-b border-navy-border px-6 flex items-center">
        {pages.map((page) => {
          const active = pathname === page.href || pathname.startsWith(page.href);
          return (
            <Link key={page.href} href={page.href}>
              <span
                className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer block border-b-2 ${
                  active
                    ? "text-accent border-accent"
                    : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
                }`}
              >
                {page.label}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
