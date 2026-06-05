import type { Guide } from "@/features/public-content/content/types";

export const guides: Guide[] = [
  {
    slug: "how-to-import-from-china-to-philippines",
    title: "How to Import from China to the Philippines",
    description:
      "A beginner-friendly overview of the usual China-to-Philippines importing flow, from supplier coordination to quote requests and shipment arrival planning.",
    category: "Beginner Guides",
    status: "published",
    publishedAt: "2026-06-05",
    keywords: [
      "how to import from china to philippines",
      "china to philippines import guide",
      "beginner importing philippines",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use this before sending cargo details to a forwarder.",
      },
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
        description: "Understand one of the most common pricing inputs.",
      },
    ],
    sections: [
      {
        heading: "Start with the product and supplier details",
        body: [
          "Most importing problems start before the shipment leaves China. You need a clear product description, quantity, packaging details, and the supplier’s pickup location before asking for freight pricing.",
          "If your supplier cannot confirm packaging size, weight, or readiness date, your quote request is weak. That usually leads to bad estimates, follow-up delays, or revised charges later.",
        ],
        bullets: [
          "Product name and basic description",
          "Supplier pickup city in China",
          "Estimated cargo readiness date",
          "Number of cartons, crates, or pallets",
          "Estimated dimensions and weight",
        ],
      },
      {
        heading: "Know the usual importing flow",
        body: [
          "A typical beginner workflow is straightforward. You source goods, confirm supplier details, request shipping quotes, compare forwarders, then decide how the shipment should move to the Philippines.",
        ],
        steps: [
          "Confirm product, quantity, and supplier pickup details.",
          "Prepare shipment size, weight, and handling requirements.",
          "Request quotes from forwarders that handle China-to-Philippines shipments.",
          "Compare pricing, transit time, inclusions, and delivery scope.",
          "Confirm requirements directly with the forwarder before the shipment moves.",
        ],
        callout: {
          tone: "warning",
          title: "Do not guess the cargo details",
          body:
            "If the shipment size or weight is missing, the quote is usually only a rough estimate. Requirements and charges may vary once the cargo is measured.",
        },
      },
      {
        heading: "Prepare better quote requests",
        body: [
          "Forwarders usually need the same basic information. If you send a vague message like 'Magkano China to Manila?', you are wasting time.",
          "A better request gives enough detail for a useful first quote without pretending you already know every technical term.",
        ],
        bullets: [
          "Origin city in China and destination in the Philippines",
          "Air or sea preference if you already have one",
          "Cargo type and whether it is general cargo or requires special handling",
          "Estimated CBM or carton dimensions",
          "Estimated gross weight",
          "Delivery preference and target timeline",
        ],
      },
      {
        heading: "Compare forwarders carefully",
        body: [
          "Do not compare on price alone. A cheap quote with missing inclusions or unclear handling rules is how beginners end up paying more later.",
          "Commonly, you should compare pricing, transit time, delivery scope, cargo restrictions, communication quality, and whether the quote clearly explains what is included.",
        ],
      },
      {
        heading: "What beginners should confirm before proceeding",
        faqs: [
          {
            question: "Do I need exact CBM before requesting a quote?",
            answer:
              "Not always, but you need a reasonable estimate. Confirm with your supplier or forwarder because pricing usually depends on size and weight.",
          },
          {
            question: "Can one quote guarantee final charges?",
            answer:
              "Usually not. Charges and requirements may vary once the cargo is measured, inspected, or classified by the forwarder.",
          },
          {
            question: "Should I ask one forwarder only?",
            answer:
              "No. Requesting multiple quotes gives you a better comparison on price, transit time, and service scope.",
          },
        ],
      },
    ],
  },
  {
    slug: "what-is-cbm",
    title: "What Is CBM in Shipping?",
    description:
      "A plain-language explanation of CBM, why forwarders ask for it, and how beginners can estimate it before requesting a shipping quote.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-04",
    keywords: ["what is cbm", "cbm shipping meaning", "cbm calculator philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "Air Cargo vs Sea Cargo: Which One Should You Use?",
        href: "/guides/air-cargo-vs-sea-cargo",
      },
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
      },
    ],
    sections: [
      {
        heading: "CBM means cubic meter",
        body: [
          "CBM stands for cubic meter. It is a common way to describe cargo volume, especially for sea shipments and consolidated freight.",
          "Forwarders ask for CBM because volume often affects pricing, space planning, and routing decisions.",
        ],
      },
      {
        heading: "How to estimate CBM",
        body: [
          "The usual formula is length x width x height in meters. If your measurements are in centimeters, convert them first or ask your supplier for the finished carton dimensions.",
        ],
        steps: [
          "Measure the package length, width, and height.",
          "Convert the measurements into meters if needed.",
          "Multiply the three numbers to estimate the volume.",
          "Multiply again by the number of packages if you have more than one carton.",
        ],
        callout: {
          tone: "tip",
          body:
            "If you do not have final dimensions yet, ask your supplier for expected carton size and count. A rough but honest estimate is better than inventing numbers.",
        },
      },
      {
        heading: "Why CBM matters in quote requests",
        bullets: [
          "It helps forwarders estimate cargo space.",
          "It affects pricing for many sea cargo arrangements.",
          "It gives forwarders a better starting point for comparing options.",
          "It reduces back-and-forth when you request multiple quotes.",
        ],
      },
      {
        heading: "Common beginner questions",
        faqs: [
          {
            question: "Can I request a quote without exact CBM?",
            answer:
              "Yes, but the estimate may be less reliable. Confirm with your forwarder because final charges may vary once the cargo is measured.",
          },
          {
            question: "Is CBM only for sea cargo?",
            answer:
              "No. Air cargo decisions also depend on size and weight, although the pricing method may differ.",
          },
        ],
      },
    ],
  },
  {
    slug: "air-cargo-vs-sea-cargo",
    title: "Air Cargo vs Sea Cargo: Which One Should You Use?",
    description:
      "A practical comparison of air cargo and sea cargo for beginners deciding between speed, cost, shipment size, and planning flexibility.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-03",
    keywords: ["air cargo vs sea cargo", "china to philippines shipping options"],
    audience: "beginner-importers",
    readingTimeMinutes: 6,
    relatedLinks: [
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
      },
    ],
    sections: [
      {
        heading: "The short version",
        body: [
          "Air cargo is usually faster and more expensive. Sea cargo is usually slower and more cost-efficient for larger shipments.",
          "That is the basic tradeoff. The correct choice depends on urgency, shipment size, weight, product type, and budget.",
        ],
      },
      {
        heading: "When air cargo usually makes sense",
        bullets: [
          "You need the shipment sooner.",
          "The cargo volume is relatively small.",
          "Delays would cost more than the added freight expense.",
          "You are testing a small first batch and want faster turnaround.",
        ],
      },
      {
        heading: "When sea cargo usually makes sense",
        bullets: [
          "The cargo is bulkier or heavier.",
          "You can plan around a longer lead time.",
          "You are trying to control landed cost more carefully.",
          "The shipment is large enough that air charges stop making sense.",
        ],
        callout: {
          tone: "info",
          body:
            "Do not choose based on guesswork. Ask for both air and sea quotes when you are unsure. Requirements and transit times may vary by cargo type and forwarder.",
        },
      },
      {
        heading: "Questions to ask before deciding",
        faqs: [
          {
            question: "Can the same cargo be quoted for both air and sea?",
            answer:
              "Often yes, if the cargo is eligible for both options. Confirm with the forwarder because restrictions may vary.",
          },
          {
            question: "Is sea cargo always cheaper?",
            answer:
              "Commonly yes for larger shipments, but not in every case. Compare the total quote scope, not just one line item.",
          },
          {
            question: "Should beginners default to air for small orders?",
            answer:
              "Not automatically. Small cargo can still be better on sea depending on timing, cost tolerance, and shipment details.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-request-a-shipping-quote",
    title: "How to Request a Shipping Quote Properly",
    description:
      "What to include in a freight quote request so forwarders can respond with clearer pricing, timeline, and service details.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-02",
    keywords: ["shipping quote request", "how to ask forwarder for quote"],
    audience: "beginner-importers",
    readingTimeMinutes: 6,
    relatedLinks: [
      {
        label: "How to Import from China to the Philippines",
        href: "/guides/how-to-import-from-china-to-philippines",
      },
      {
        label: "List of China to Philippines Forwarders",
        href: "/guides/list-of-forwarders-china-to-philippines",
      },
    ],
    sections: [
      {
        heading: "Weak quote requests create weak quotes",
        body: [
          "If your request is incomplete, the quote will usually be incomplete too. That is not the forwarder being difficult. That is you giving them a bad starting point.",
          "You do not need perfect technical knowledge. You need enough cargo and routing detail for the forwarder to estimate properly.",
        ],
      },
      {
        heading: "What to include in your request",
        bullets: [
          "Origin city in China",
          "Destination city or province in the Philippines",
          "Cargo description",
          "Estimated dimensions, CBM, or carton count",
          "Estimated gross weight",
          "Preferred shipment mode if known",
          "Target delivery window",
          "Special handling or document concerns if applicable",
        ],
      },
      {
        heading: "A clean beginner workflow",
        steps: [
          "Gather the shipment details from your supplier.",
          "Prepare one complete request instead of repeating fragments in chat.",
          "Send the same core request to multiple forwarders.",
          "Compare inclusions, exclusions, and transit ranges carefully.",
          "Confirm unclear items before choosing a forwarder.",
        ],
        callout: {
          tone: "warning",
          body:
            "Do not assume taxes, duties, permits, pickup, delivery, or storage are covered unless the quote says so clearly. Requirements may vary.",
        },
      },
      {
        heading: "Questions beginners usually ask",
        faqs: [
          {
            question: "Can I ask for a quote before the supplier finishes packing?",
            answer:
              "Yes, but say that the measurements are estimated. Forwarders can usually give an initial quote based on expected cargo details.",
          },
          {
            question: "Should I send product photos?",
            answer:
              "Sometimes that helps, especially if the cargo needs special handling. Confirm directly with the forwarder if photos would improve the quote.",
          },
        ],
      },
    ],
  },
  {
    slug: "list-of-forwarders-china-to-philippines",
    title: "List of China to Philippines Forwarders",
    description:
      "How to approach a forwarder shortlist, what to compare, and why quote quality matters more than chasing the first name you find.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-01",
    keywords: ["china to philippines forwarders", "forwarder list philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 7,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
      },
      {
        label: "Create a free account",
        href: "/sign-up",
        description: "Post one shipment request and compare private quotes.",
      },
    ],
    sections: [
      {
        heading: "Start with a shortlist, not blind trust",
        body: [
          "Beginners often waste time looking for the single 'best' forwarder. That is naive. What you need first is a shortlist of forwarders that appear relevant to your shipment type and route.",
          "Then you compare quote clarity, responsiveness, transit expectations, and service scope. The shortlist is only a starting point.",
        ],
        callout: {
          tone: "warning",
          title: "Verification matters",
          body:
            "Do not assume every listing is verified or endorsed unless the platform clearly says so. Listing status, requirements, and service quality may vary.",
        },
      },
      {
        heading: "What to compare on a forwarder shortlist",
        bullets: [
          "Whether they handle China-to-Philippines shipments like yours",
          "How clearly they explain pricing and inclusions",
          "Whether they ask the right follow-up questions",
          "Transit time ranges and delivery scope",
          "Communication quality before you commit",
        ],
      },
      {
        heading: "Use marketplace tools properly",
        body: [
          "A quote marketplace is useful because you can prepare one request and collect multiple private quotes. That is better than chasing scattered replies across chat threads.",
          "The goal is not to crown a winner from a list page. The goal is to gather enough structured quote detail to make a better decision.",
        ],
      },
      {
        heading: "Common questions about forwarder lists",
        faqs: [
          {
            question: "Does a listed forwarder mean the platform guarantees the shipment?",
            answer:
              "No. Do not assume guarantees, endorsements, or delivery promises unless they are stated clearly and supported by the actual service terms.",
          },
          {
            question: "Should I contact only one forwarder from a list?",
            answer:
              "No. A shortlist is more useful when you request multiple quotes and compare the responses side by side.",
          },
        ],
      },
    ],
  },
  {
    slug: "draft-guide-example",
    title: "Draft Guide Example",
    description: "Internal draft used to verify published-route filtering.",
    category: "Drafts",
    status: "draft",
    publishedAt: "2026-06-06",
    sections: [
      {
        heading: "Draft only",
        body: ["This guide should never render on public published routes."],
      },
    ],
  },
];
