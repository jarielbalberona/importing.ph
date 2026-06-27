import type { Guide } from "@/features/public-content/content/types";

export const guides: Guide[] = [
  {
    slug: "how-to-import-from-china-to-philippines",
    title: "How to Import from China to the Philippines",
    description:
      "A practical guide for first-time importers that walks through supplier prep, shipment sizing, and choosing quotes for a China-to-Philippines shipment.",
    category: "Beginner Guides",
    status: "published",
    publishedAt: "2026-06-05",
    keywords: [
      "how to import from china to philippines",
      "china to philippines import guide",
      "beginner importing philippines",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 10,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "A practical checklist to make your request easier for forwarders to quote.",
      },
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
        description: "Learn what to measure so your request is easier to price.",
      },
      {
        label: "Air Cargo vs Sea Cargo",
        href: "/guides/air-cargo-vs-sea-cargo",
        description: "Compare common air-sea tradeoffs before you choose a mode.",
      },
    ],
    sections: [
      {
        heading: "Start with the supplier details, not with random price shopping",
        body: [
          "Most beginners jump straight to 'Magkano papuntang Pilipinas?' and then wonder why the answers are vague. The quote is only as good as the shipment details you provide.",
          "Before you contact forwarders, collect the product description, supplier pickup city, expected ready date, estimated carton count, dimensions, and gross weight. If your supplier cannot confirm those basics yet, your quote will usually stay rough.",
        ],
        bullets: [
          "Product name and plain-language description",
          "Supplier or pickup city in China",
          "Expected cargo ready date",
          "Carton, crate, or pallet count",
          "Estimated dimensions and gross weight",
          "Any special handling concern such as fragile items, liquids, batteries, or oversized cargo",
        ],
      },
      {
        heading: "Know the usual beginner workflow",
        body: [
          "The importing flow is usually simple: confirm supplier details, ask for quotes, compare forwarders, then choose how the shipment should move into the Philippines.",
          "What changes from shipment to shipment is the documentation, handling restrictions, timing, and whether the cargo makes more sense by air or sea. Requirements may vary, so do not assume one shipment behaves exactly like the previous one.",
        ],
        steps: [
          "Confirm the product, quantity, and supplier pickup details.",
          "Estimate the shipment size, total weight, and carton count as honestly as you can.",
          "Request quotes from forwarders that handle China-to-Philippines routes.",
          "Compare pricing, transit ranges, inclusions, exclusions, and delivery scope.",
          "Clarify unclear assumptions before the cargo moves.",
          "Proceed with the forwarder that best fits your budget, timing, and cargo type.",
        ],
      },
      {
        heading: "The shipment details beginners usually miss",
        body: [
          "Weak requests usually miss one of four things: actual cargo description, shipment size, destination detail, or timing. Then the forwarder has to guess, and you get guess-level pricing back.",
          "If you do not know exact numbers yet, say that the figures are estimated. Honest estimates are useful. Invented numbers are not.",
        ],
        bullets: [
          "Whether the cargo is general merchandise or needs special handling",
          "Whether the dimensions are for one carton or the total shipment",
          "Whether the destination is door delivery or warehouse pickup",
          "Whether the shipment is urgent or flexible on timing",
          "Whether the cargo is already packed or still being finalized by the supplier",
        ],
        callout: {
          tone: "warning",
          title: "Do not treat early quotes as guarantees",
          body:
            "Commonly, the first quote is based on the details you provide at that time. Charges, routing, and requirements may vary once the cargo is measured or reviewed more closely.",
        },
      },
      {
        heading: "How to compare forwarders without wasting time",
        body: [
          "Price matters, but price alone is a bad decision rule. A cheaper quote that hides exclusions or avoids specific questions can cost more later.",
          "Usually, you should compare the shipment mode, transit range, delivery coverage, document assumptions, communication quality, and how clearly the quote explains what is included.",
        ],
        bullets: [
          "Quote amount and currency",
          "Transit range instead of one optimistic number",
          "What is included and what is not included",
          "Whether pickup, warehouse receiving, delivery, or customs support is mentioned",
          "Whether the forwarder asked good follow-up questions",
          "Whether the quote still looks sensible after you review your dimensions and weight",
        ],
      },
      {
        heading: "What beginners should confirm before moving forward",
        faqs: [
          {
            question: "Do I need exact CBM before requesting a quote?",
            answer:
              "Not always, but you should share a reasonable estimate. Confirm with your supplier or forwarder because volume and weight usually affect pricing.",
          },
          {
            question: "Can one quote guarantee final charges?",
            answer:
              "Usually not. Final handling, routing, and pricing may vary once the cargo is measured, reviewed, or classified more closely.",
          },
          {
            question: "Should I ask one forwarder only?",
            answer:
              "No. Asking for multiple quotes gives you a more useful view of market pricing, transit expectations, and service scope.",
          },
        ],
      },
    ],
  },
  {
    slug: "what-is-cbm",
    title: "What Is CBM in Shipping?",
    description:
      "A practical explanation of CBM, why it is usually asked for, and how to estimate shipment volume before quoting.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-04",
    keywords: ["what is cbm", "cbm shipping meaning", "cbm calculator philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 7,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use your CBM estimate to make your quote request clearer.",
      },
      {
        label: "Air Cargo vs Sea Cargo",
        href: "/guides/air-cargo-vs-sea-cargo",
        description: "See how shipment size affects the air-vs-sea decision.",
      },
    ],
    sections: [
      {
        heading: "CBM means cubic meter",
        body: [
          "CBM stands for cubic meter. In plain language, it is a way to describe how much space your cargo takes up.",
          "Forwarders commonly ask for CBM because cargo volume affects planning, consolidation, and quote accuracy. Without it, they must quote off rough estimates.",
        ],
      },
      {
        heading: "Why beginners keep hearing about CBM",
        body: [
          "Beginners often know the product and the number of cartons, but not the total shipment volume. That is exactly why CBM comes up in quote requests.",
          "If a forwarder is comparing a small test shipment against a bulky order, volume changes the decision even before the cargo leaves China.",
        ],
        bullets: [
          "CBM helps forwarders estimate required cargo space.",
          "CBM often affects pricing for consolidated sea shipments.",
          "CBM helps compare shipment options more realistically.",
          "CBM reduces the back-and-forth when you ask multiple forwarders for quotes.",
        ],
      },
      {
        heading: "How to estimate CBM from carton dimensions",
        body: [
          "The usual approach is simple: length x width x height in meters. If your supplier gives the carton dimensions in centimeters, convert them before multiplying.",
          "If you have multiple cartons of the same size, multiply the single-carton CBM by the carton count. If the cartons are not all the same size, ask your supplier for a packing summary instead of guessing.",
        ],
        steps: [
          "Get the length, width, and height of one carton or package.",
          "Convert the measurements into meters if they are given in centimeters.",
          "Multiply length x width x height to estimate the volume of one package.",
          "Multiply that result by the number of packages if they share the same size.",
        ],
        callout: {
          tone: "tip",
          title: "If exact dimensions are not final yet",
          body:
            "Ask your supplier for expected carton size and count. A rough but honest estimate is usually more useful than leaving the shipment size blank.",
        },
      },
      {
        heading: "CBM, weight, and quote accuracy",
        body: [
          "CBM on its own is not enough. Forwarders usually want both shipment volume and gross weight because some shipments are light but bulky, while others are compact but heavy.",
          "That is why quote forms often ask for CBM, weight, carton count, and dimensions in the same section. Those details work together.",
        ],
        bullets: [
          "Use gross weight if your supplier can provide it.",
          "If you know only dimensions, include carton count as well.",
          "If you know only total CBM, still try to provide gross weight.",
          "If the cargo is not packed yet, say clearly that the dimensions are estimated.",
        ],
      },
      {
        heading: "Common beginner questions",
        faqs: [
          {
            question: "Can I request a quote without exact CBM?",
            answer:
              "Yes. But the quote may be less precise. Confirm with your forwarder because rates and routing may change once the shipment is measured.",
          },
          {
            question: "Is CBM only for sea cargo?",
            answer:
              "No. Air cargo decisions also depend on shipment size and weight, even if the pricing approach differs.",
          },
          {
            question: "What if I only know the number of cartons?",
            answer:
              "Ask your supplier for the carton dimensions and gross weight. Carton count alone is usually not enough for a useful quote.",
          },
        ],
      },
    ],
  },
  {
    slug: "air-cargo-vs-sea-cargo",
    title: "Air Cargo vs Sea Cargo: Which One Should You Use?",
    description:
      "A practical beginner comparison of air and sea cargo based on urgency, size, budget, and common tradeoffs importers face.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-03",
    keywords: ["air cargo vs sea cargo", "china to philippines shipping options"],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
        description: "Use this when you need to estimate size before comparing air and sea options.",
      },
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Ask for both air and sea options when you are still deciding.",
      },
    ],
    sections: [
      {
        heading: "The short version",
        body: [
          "Air cargo is usually faster and more expensive. Sea cargo is usually slower and more cost-efficient for larger shipments.",
          "That is the basic tradeoff, but it is still a simplification. The right choice also depends on urgency, shipment size, weight, cargo type, and how much delay risk you can tolerate.",
        ],
      },
      {
        heading: "When air cargo commonly makes sense",
        body: [
          "Air cargo usually makes sense when time matters more than freight savings. It is often used for small or urgent shipments, first-batch testing, or cargo that would lose value if it arrives too late.",
        ],
        bullets: [
          "You need the shipment sooner.",
          "The cargo volume is still relatively small.",
          "The inventory is urgent for a launch, sale, or restock.",
          "You are testing a small first order before committing to a larger sea shipment.",
        ],
      },
      {
        heading: "When sea cargo commonly makes sense",
        body: [
          "Sea cargo usually makes sense when the shipment is bulkier, heavier, or less urgent. It often gives better value if you can plan ahead.",
          "For many beginners, sea becomes more attractive as the order grows and air charges stop looking reasonable.",
        ],
        bullets: [
          "The cargo is bulky or heavy.",
          "You can work with a longer lead time.",
          "You are trying to control landed cost more carefully.",
          "The order size is big enough that air charges look disproportionate.",
        ],
        callout: {
          tone: "info",
          title: "Do not decide from one vague quote",
          body:
            "If you are unsure, ask for both air and sea options using the same shipment details. Requirements, transit ranges, and pricing logic may vary by cargo type and forwarder.",
        },
      },
      {
        heading: "How shipment size changes the decision",
        body: [
          "The air-vs-sea decision becomes easier once you know the approximate carton dimensions, weight, and total CBM. Without that, you are not comparing real options.",
          "A small and light shipment may still fit air. A bulky shipment that seems 'not too many cartons' can still push you toward sea once the volume is clear.",
        ],
        bullets: [
          "Get the carton dimensions, total weight, and carton count first.",
          "Ask whether the quote is based on estimated or confirmed measurements.",
          "Compare both the transit range and the total quote scope.",
          "Check if pickup, warehouse handling, or delivery assumptions differ between the two options.",
        ],
      },
      {
        heading: "Questions to ask before choosing",
        faqs: [
          {
            question: "Can the same cargo be quoted for both air and sea?",
            answer:
              "Often yes, if the cargo is eligible for both options. Confirm with the forwarder because restrictions may vary.",
          },
          {
            question: "Is sea cargo always cheaper?",
            answer:
              "Commonly for larger shipments, yes, but not in every case. Compare the total quote scope, not just one price line.",
          },
          {
            question: "Should beginners default to air for small orders?",
            answer:
              "Not automatically. A small shipment can still be better on sea depending on timing, total cost tolerance, and how the cargo is packed.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-request-a-shipping-quote",
    title: "How to Request a Shipping Quote Properly",
    description:
      "A practical checklist of the shipment details forwarders usually need so they can give you clearer pricing, transit windows, and service coverage.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-02",
    keywords: ["shipping quote request", "how to ask forwarder for quote"],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "How to Import from China to the Philippines",
        href: "/guides/how-to-import-from-china-to-philippines",
        description: "Use this if you still need the overall beginner workflow first.",
      },
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
        description: "Use this when you need help estimating dimensions or volume.",
      },
      {
        label: "List of China to Philippines Forwarders",
        href: "/guides/list-of-forwarders-china-to-philippines",
        description: "Use this when you are deciding how to build a useful forwarder shortlist.",
      },
    ],
    sections: [
      {
        heading: "Weak quote requests create weak quotes",
        body: [
          "If your request is incomplete, the quote is usually incomplete too. That is not a platform problem. That is poor input.",
          "You do not need expert freight vocabulary, but you do need enough shipment detail for a forwarder to estimate responsibly.",
        ],
      },
      {
        heading: "What a useful quote request usually includes",
        body: [
          "Most forwarders need the same practical inputs before they can give a useful initial quote. If several of these are missing, expect more follow-up questions and less reliable pricing.",
        ],
        bullets: [
          "Origin city in China",
          "Destination city or province in the Philippines",
          "Cargo description in plain language",
          "Estimated carton count, dimensions, total CBM, or a combination of those",
          "Estimated gross weight",
          "Preferred shipment mode if you already have one",
          "Delivery setup such as door delivery or warehouse pickup",
          "Target timing or urgency",
          "Special handling concerns such as fragile items, liquids, or batteries",
        ],
      },
      {
        heading: "How to avoid quote surprises later",
        body: [
          "Most quote surprises are not random. They usually come from missing shipment details, unclear inclusions, or assumptions that were never confirmed.",
          "A cheap quote can still be a bad quote if the shipment scope is vague.",
        ],
        bullets: [
          "Ask what is included and what is not included.",
          "Check whether the dimensions and weight are estimated or confirmed.",
          "Confirm whether pickup and delivery are part of the quote.",
          "Ask whether special documents or handling conditions may change the quote.",
          "Compare the same shipment details across multiple forwarders instead of changing the story every time.",
        ],
        callout: {
          tone: "warning",
          body:
            "Do not assume duties, taxes, permits, storage, pickup, or final delivery are covered unless the quote says so clearly. Requirements may vary by shipment.",
        },
      },
      {
        heading: "A clean beginner workflow",
        steps: [
          "Collect the shipment details from your supplier first.",
          "Prepare one complete request instead of sharing partial details in different chats.",
          "Send the same core request to multiple forwarders.",
          "Compare pricing, transit range, inclusions, exclusions, and follow-up questions.",
          "Clarify unclear assumptions before choosing a forwarder.",
        ],
      },
      {
        heading: "Questions beginners usually ask",
        faqs: [
      {
            question: "Can I ask for a quote before the supplier finishes packing?",
            answer:
              "Yes. Say clearly that dimensions and weight are estimated. Forwarders can usually provide an initial quote from those estimates.",
          },
          {
            question: "Should I send product photos?",
            answer:
              "Sometimes that helps, especially if the cargo needs special handling. Confirm with the forwarder if photos would improve the quote.",
          },
          {
            question: "Should I ask for air and sea pricing at the same time?",
            answer:
              "Usually yes if you are still deciding. Using the same cargo details makes the comparison more useful.",
          },
        ],
      },
    ],
  },
  {
    slug: "list-of-forwarders-china-to-philippines",
    title: "List of China to Philippines Forwarders",
    description:
      "A practical guide to building and comparing a forwarder shortlist before you send one request to many candidates.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-01",
    keywords: ["china to philippines forwarders", "forwarder list philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use the same shipment request when comparing multiple forwarders.",
      },
      {
        label: "Create a free account",
        href: "/sign-up",
        description: "Post one shipment request and receive private quotes in one place.",
      },
    ],
    sections: [
      {
        heading: "Start with a shortlist, not blind trust",
        body: [
          "Beginners often waste time looking for the single 'best' forwarder. That is the wrong first question. The real job is building a shortlist that fits your shipment type, route, and budget range.",
          "After that, compare who gives the clearest quote, asks the right questions, and looks realistic about timing and scope.",
        ],
      },
      {
        heading: "What to compare on a forwarder shortlist",
        bullets: [
          "Whether they commonly handle China-to-Philippines shipments like yours",
          "How clearly they explain pricing and service coverage",
          "Whether they ask sensible follow-up questions before quoting",
          "Transit ranges and delivery setup",
          "Whether they mention exclusions and document assumptions clearly",
          "How responsive and practical they are before you commit",
        ],
      },
      {
        heading: "Do not overread listing status",
        body: [
          "Some platforms use status labels. Read them closely and take them as a starting point, not a quality promise.",
          "Do not assume every listed forwarder guarantees your preferred price, communication speed, or delivery outcome. Requirements, responsiveness, and service quality may vary.",
        ],
        callout: {
          tone: "warning",
          title: "A list is not a guarantee",
          body:
            "A forwarder on a list is a starting point only. It does not guarantee pricing, service quality, or outcome.",
        },
      },
      {
        heading: "How a quote marketplace helps",
        body: [
          "A quote marketplace is useful because you can prepare one shipment request and receive multiple private quotes tied to the same cargo details.",
          "That is much better than chasing scattered replies across Messenger, Viber, and personal referrals where every forwarder gets a slightly different version of the shipment.",
        ],
        bullets: [
          "You describe the shipment once.",
          "Forwarders quote from the same core request.",
          "You compare pricing, transit, inclusions, and notes side by side.",
          "You keep the follow-up conversation connected to the quote.",
        ],
      },
      {
        heading: "Common questions about forwarder lists",
        faqs: [
          {
            question: "Does a listed forwarder mean the platform guarantees the shipment?",
            answer:
              "No. Do not assume guarantees, endorsements, or delivery promises unless those are stated clearly and supported by the actual service terms.",
          },
          {
            question: "Should I contact only one forwarder from a list?",
            answer:
              "No. A shortlist is more useful when you request multiple quotes and compare the responses side by side.",
          },
          {
            question: "What matters more: the name on the list or the quality of the quote?",
            answer:
              "The quality of the quote matters more. A clear quote with sensible assumptions is usually more useful than a familiar name with vague pricing.",
          },
        ],
      },
    ],
  },
  {
    slug: "china-to-philippines-shipping-quote",
    title: "China to Philippines Shipping Quote: What to Prepare",
    description:
      "A practical checklist for getting comparable China-to-Philippines shipping quotes without vague pricing or repeated back-and-forth.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-07",
    keywords: [
      "china to philippines shipping quote",
      "shipping quote philippines",
      "cargo forwarder philippines quote",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 7,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote Properly",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use the same details when asking multiple forwarders to quote.",
      },
      {
        label: "What Is CBM in Shipping?",
        href: "/guides/what-is-cbm",
        description: "Estimate volume before comparing air and sea cargo options.",
      },
      {
        label: "Create a free account",
        href: "/sign-up",
        description: "Post one request and compare private forwarder quotes.",
      },
    ],
    sections: [
      {
        heading: "A useful quote starts with useful shipment details",
        body: [
          "A China-to-Philippines shipping quote is not just a price request. It is a summary of assumptions about pickup, cargo size, delivery scope, timing, and handling risk.",
          "If those assumptions are missing, forwarders either guess or ask the same questions again. That slows the quote down and makes comparison harder.",
        ],
      },
      {
        heading: "Minimum details to include",
        bullets: [
          "Supplier or pickup city in China",
          "Cargo description and cargo type",
          "Carton count, total CBM, gross weight, or complete dimensions",
          "Destination city or municipality in the Philippines",
          "Preferred mode: air, sea, either, or not sure",
          "Delivery scope: door delivery, warehouse pickup, or not sure",
          "Special handling notes such as fragile goods, batteries, liquids, or documents",
        ],
      },
      {
        heading: "How to compare quotes without fooling yourself",
        body: [
          "Do not compare only the headline amount. A cheaper quote can be worse if it excludes handling, delivery, permits, duties, or storage assumptions that another quote included.",
          "For a cleaner marketplace comparison, compare price, mode, transit range, inclusions, exclusions, validity date, and forwarder notes side by side.",
        ],
        bullets: [
          "Quote amount and currency",
          "Air or sea mode",
          "Estimated transit range",
          "Inclusions and exclusions",
          "Quote validity date",
          "Clarifying notes and assumptions",
        ],
      },
      {
        heading: "Common questions",
        faqs: [
          {
            question: "Can I ask for a quote if I am not sure whether to use air or sea?",
            answer:
              "Yes. Say that you are not sure and include shipment size, weight, and urgency. A forwarder can usually recommend whether air or sea is realistic.",
          },
          {
            question: "Should I send the same request to multiple forwarders?",
            answer:
              "Yes. Using one consistent request makes the quote comparison more honest because every forwarder is responding to the same facts.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-freight-forwarder-philippines",
    title: "How to Choose a Freight Forwarder in the Philippines",
    description:
      "A practical importer checklist for comparing forwarders by quote quality, service scope, responsiveness, and risk instead of price alone.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-08",
    keywords: [
      "how to choose freight forwarder philippines",
      "freight forwarder philippines",
      "cargo forwarder philippines",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "List of China to Philippines Forwarders",
        href: "/guides/list-of-forwarders-china-to-philippines",
        description: "Start with a shortlist, then compare quote quality.",
      },
      {
        label: "China to Philippines Shipping Quote",
        href: "/guides/china-to-philippines-shipping-quote",
        description: "Prepare the request details forwarders need before they quote.",
      },
    ],
    sections: [
      {
        heading: "The cheapest forwarder is not automatically the best choice",
        body: [
          "A forwarder should be judged by how clearly they handle your actual shipment, not by a generic lowest number.",
          "For beginners, the safer comparison is quote quality: what is included, what is excluded, what timing is realistic, and whether the forwarder asks practical follow-up questions.",
        ],
      },
      {
        heading: "Signals of a stronger forwarder response",
        bullets: [
          "They answer based on your actual cargo details.",
          "They give a transit range instead of one perfect date.",
          "They separate inclusions from exclusions.",
          "They flag special handling risks early.",
          "They explain what information is still missing.",
          "They keep communication tied to the quote instead of scattering details across channels.",
        ],
      },
      {
        heading: "Red flags to slow down for",
        bullets: [
          "Very low price with no assumptions",
          "No clear delivery scope",
          "No validity date",
          "Unclear responsibility for duties, taxes, storage, or permits",
          "Pressure to proceed before cargo details are confirmed",
          "Avoiding basic questions about cargo size, weight, or destination",
        ],
      },
      {
        heading: "Use marketplace comparison to reduce guesswork",
        body: [
          "A marketplace does not remove the need for judgment. It gives you a cleaner comparison surface.",
          "When forwarders quote the same request, you can see who is clear, who is vague, who is realistic, and who fits the shipment best.",
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
