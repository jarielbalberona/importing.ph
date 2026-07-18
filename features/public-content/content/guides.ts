import type { Guide } from "@/features/public-content/content/types";

export const guides: Guide[] = [
  {
    slug: "how-to-import-from-china-to-philippines",
    title: "How to Import from China to the Philippines",
    description:
      "A step-by-step guide for Filipino business owners covering supplier checks, import requirements, shipping options, documents, landed cost, and forwarder quotes.",
    category: "Beginner Guides",
    status: "published",
    publishedAt: "2026-06-05",
    updatedAt: "2026-07-19",
    keywords: [
      "how to import from china to philippines",
      "import from china to philippines",
      "china to philippines import guide",
      "philippines import requirements",
      "beginner importing philippines",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 8,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote: A Practical Template",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "A practical checklist to make your request easier for forwarders to quote.",
      },
      {
        label: "What Is CBM in Shipping? Formula and Examples",
        href: "/guides/what-is-cbm",
        description: "Learn what to measure so your request is easier to price.",
      },
      {
        label: "Air Freight vs Sea Freight from China to the Philippines",
        href: "/guides/air-cargo-vs-sea-cargo",
        description: "Compare common air-sea tradeoffs before you choose a mode.",
      },
      {
        label: "China-to-Philippines Shipping Cost and Quote Guide",
        href: "/guides/china-to-philippines-shipping-quote",
        description: "Understand cost drivers and what an all-in quote should include.",
      },
      {
        label: "How to Choose a Freight Forwarder in the Philippines",
        href: "/guides/how-to-choose-a-freight-forwarder-philippines",
        description: "Verify providers and compare risk, scope, and quote quality.",
      },
    ],
    sources: [
      {
        label: "Process of Importation",
        href: "https://customs.gov.ph/process-of-importation/",
        publisher: "Philippine Bureau of Customs",
      },
      {
        label: "BOC Accreditation and Registration of Importers",
        href: "https://customs.gov.ph/boc-accreditation/",
        publisher: "Philippine Bureau of Customs",
      },
      {
        label: "Prohibited and Restricted Importations",
        href: "https://customs.gov.ph/prohibited-restricted-importations/",
        publisher: "Philippine Bureau of Customs",
      },
      {
        label: "Philippine Tariff Finder",
        href: "https://tariffcommission.gov.ph/",
        publisher: "Philippine Tariff Commission",
      },
    ],
    sections: [
      {
        heading: "Start with the product and supplier, not the shipping price",
        body: [
          "Most beginners jump straight to 'Magkano papuntang Pilipinas?' and then wonder why the answers are vague. Freight is only one part of the decision. First confirm that the supplier, product, quantity, and commercial terms make sense.",
          "Ask for a sample or a small trial order when quality is uncertain. Confirm the exact legal business name receiving payment, the product specification, unit price, minimum order, production lead time, defect policy, and who pays for transport to the China warehouse or port. Keep these terms in a purchase order or written platform record.",
        ],
        bullets: [
          "Product name, material, model, intended use, and plain-language description",
          "Sample approval or another documented quality check",
          "Supplier identity and payment beneficiary",
          "Unit price, quantity, production lead time, and Incoterm",
          "Supplier or pickup city in China",
          "Expected cargo ready date",
          "Carton, crate, or pallet count",
          "Estimated dimensions and gross weight",
          "Any special handling concern such as fragile items, liquids, batteries, or oversized cargo",
        ],
      },
      {
        heading: "Check the Philippine import requirements before you pay",
        body: [
          "A forwarder can move cargo, but a forwarder cannot make a prohibited product legal or erase a permit requirement. Product eligibility should be checked before production or final payment, not after the shipment reaches a warehouse.",
          "The Bureau of Customs identifies regulated goods that may need permits or clearances from agencies such as the FDA, BPS, BPI, BAI, or NTC. The responsible agency depends on the actual product and use. Food, plants, animal products, medicines, chemicals, electrical products, telecommunications equipment, and other regulated categories deserve an early compliance check.",
        ],
        steps: [
          "Write a precise product description, including material, model, intended use, and brand status.",
          "Ask a licensed customs broker or the relevant regulator whether the product is regulated, restricted, or prohibited.",
          "Identify the likely HS or AHTN classification and check the Philippine Tariff Finder for an initial tariff reference.",
          "Confirm which permits, labels, test reports, or certificates must exist before shipment.",
          "Do not release the cargo until the importer, broker, and forwarder agree on the compliance plan.",
        ],
        callout: {
          tone: "warning",
          title: "Do this before final supplier payment",
          body:
            "A cheap product becomes expensive when it cannot be cleared, must be stored while permits are fixed, or has to be returned or abandoned. Get product-specific advice from the responsible regulator or a licensed customs professional.",
        },
      },
      {
        heading: "Decide who will be the importer and who handles customs",
        body: [
          "Do not use 'door to door' as a substitute for understanding responsibility. Ask who will appear as the importer or consignee, who will lodge the goods declaration, and who is responsible if Customs asks for more documents or assesses additional charges.",
          "The Bureau of Customs says importers that transact with it must be accredited or registered. Its current guidance distinguishes a non-regular importer for an intended once-in-365-days importation from a regular importer for ongoing import activity. Your situation, shipment value, cargo, and service arrangement determine what is required, so confirm the setup before shipping.",
        ],
        bullets: [
          "Importer or consignee named on the shipment documents",
          "BOC registration or accreditation responsibility",
          "Licensed customs broker and declaration responsibility",
          "Permit holder for any regulated product",
          "Party responsible for duties, taxes, storage, examinations, and unexpected charges",
          "Documents you will receive after clearance and delivery",
        ],
      },
      {
        heading: "Know the usual beginner workflow",
        body: [
          "The importing flow is understandable, but it is not just buy, ship, and wait. Each handoff should have an owner and a document trail.",
          "What changes from shipment to shipment is the product regulation, documentation, handling restrictions, timing, and whether the cargo makes more sense by courier, air, LCL sea, or FCL sea. Do not assume one successful shipment proves the next product can follow the same route.",
        ],
        steps: [
          "Validate the product, supplier, sample, price, and commercial terms.",
          "Check product restrictions, permits, likely tariff classification, and importer requirements.",
          "Confirm packing details: carton count, dimensions, CBM, gross weight, and cargo-ready date.",
          "Request comparable China-to-Philippines quotes using the same shipment facts.",
          "Choose the mode and forwarder after comparing scope, not just the headline freight price.",
          "Align the commercial invoice, packing list, transport document, and required permits before departure.",
          "Track pickup, export handling, transit, Philippine clearance, and final delivery as separate milestones.",
          "Keep the final documents and actual landed cost for the next order.",
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
        heading: "Prepare the documents before cargo pickup",
        body: [
          "Document names and requirements vary by shipment, but the commercial invoice, packing list, and bill of lading or air waybill are common starting points. The product description, quantity, value, buyer, seller, package count, and weights should not contradict one another across those documents.",
          "If you are claiming a preferential tariff treatment, importing regulated goods, or using a special clearance arrangement, additional origin documents, permits, registrations, or product records may be required. Ask who prepares each document, who reviews it, and what the deadline is.",
        ],
        bullets: [
          "Commercial invoice with a truthful product description and value",
          "Packing list that matches the physical packages",
          "Bill of lading or air waybill",
          "Permits, clearances, product registrations, or test documents when applicable",
          "Certificate of origin or other preference documents when applicable",
          "Insurance evidence when cargo insurance is purchased",
        ],
      },
      {
        heading: "Budget the landed cost, not only the supplier invoice",
        body: [
          "Your real cost is the amount required to place usable inventory at your Philippine destination. Supplier price and freight are only two lines in that total.",
          "Build a simple landed-cost sheet before ordering. Use a range for uncertain items, then replace estimates with actual amounts after delivery. That gives you a real basis for pricing the product or deciding whether the order is commercially sensible.",
        ],
        bullets: [
          "Product and sample cost",
          "China pickup, consolidation, export handling, and origin charges",
          "International freight and cargo insurance",
          "Customs duty, VAT, and other government charges when applicable",
          "Brokerage, port or terminal, storage, and examination charges when applicable",
          "Philippine delivery, unloading, and inter-island transport",
          "Allowance for currency movement, damage, delay, defects, and unsold stock",
        ],
        callout: {
          tone: "tip",
          title: "Avoid fake certainty",
          body:
            "Freight rates, exchange rates, classifications, and government assessments can change. Use current written quotes and official sources rather than copying an old per-kilo or per-CBM number from a social-media post.",
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
          "Who handles customs clearance and what happens if Customs asks for more information",
          "Claims process, cargo insurance option, payment terms, and quote validity",
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
          {
            question: "Do I need a license to import from China to the Philippines?",
            answer:
              "The answer depends on whether the importation is personal or commercial, regular or one-time, and whether the product is regulated. The Bureau of Customs publishes importer registration and accreditation guidance, while product-specific permits come from the responsible regulatory agency. Confirm your exact setup before shipping.",
          },
          {
            question: "Are duties and taxes automatically included in a forwarder quote?",
            answer:
              "No. Some quotes are all-in, while others cover only selected origin, freight, clearance, or delivery charges. Ask for written inclusions, exclusions, assumptions, and responsibility for any additional Customs assessment.",
          },
        ],
      },
    ],
  },
  {
    slug: "what-is-cbm",
    title: "What Is CBM in Shipping? Formula and Examples",
    description:
      "Learn the CBM formula, calculate carton volume in meters or centimeters, avoid common measurement mistakes, and prepare better shipping quotes.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-04",
    updatedAt: "2026-07-19",
    keywords: ["what is cbm", "cbm formula", "how to calculate cbm", "cbm shipping meaning", "cbm calculator philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote: A Practical Template",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use your CBM estimate to make your quote request clearer.",
      },
      {
        label: "Air Freight vs Sea Freight from China to the Philippines",
        href: "/guides/air-cargo-vs-sea-cargo",
        description: "See how shipment size affects the air-vs-sea decision.",
      },
      {
        label: "China-to-Philippines Shipping Cost and Quote Guide",
        href: "/guides/china-to-philippines-shipping-quote",
        description: "See how CBM fits into a complete shipping-cost comparison.",
      },
    ],
    sections: [
      {
        heading: "CBM means cubic meter",
        body: [
          "CBM stands for cubic meter. In plain language, it is a way to describe how much space your cargo takes up.",
          "Forwarders commonly ask for CBM because cargo volume affects planning, consolidation, and quote accuracy. One CBM is a cube that measures one meter long, one meter wide, and one meter high. Without usable dimensions or a total CBM, a forwarder must quote from rough estimates.",
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
        heading: "Worked CBM examples",
        body: [
          "Example 1: one carton measures 60 cm x 40 cm x 50 cm. Convert to meters, then multiply: 0.60 x 0.40 x 0.50 = 0.12 CBM.",
          "Example 2: you have 10 identical cartons at 0.12 CBM each. Multiply 0.12 x 10 = 1.20 CBM for the shipment.",
          "You can also calculate directly from centimeters: length x width x height x carton count, then divide by 1,000,000. For the same cartons: 60 x 40 x 50 x 10 / 1,000,000 = 1.20 CBM.",
        ],
        callout: {
          tone: "tip",
          title: "Round only at the end",
          body:
            "Keep several decimal places while calculating each carton group, add the groups together, then round the total. Early rounding can distort the shipment volume when many cartons are involved.",
        },
      },
      {
        heading: "CBM, weight, and quote accuracy",
        body: [
          "CBM on its own is not enough. Forwarders usually want both shipment volume and gross weight because some shipments are light but bulky, while others are compact but heavy.",
          "That is why quote forms often ask for CBM, weight, carton count, and dimensions in the same section. Air cargo and courier services may also compare actual weight with a volumetric or chargeable weight calculated under their own rules. Do not assume a sea-freight CBM calculation is the final air-freight chargeable weight.",
        ],
        bullets: [
          "Use gross weight if your supplier can provide it.",
          "If you know only dimensions, include carton count as well.",
          "If you know only total CBM, still try to provide gross weight.",
          "If the cargo is not packed yet, say clearly that the dimensions are estimated.",
        ],
      },
      {
        heading: "Common CBM mistakes that change a quote",
        bullets: [
          "Using product dimensions instead of the packed carton dimensions",
          "Mixing centimeters, millimeters, and meters in one calculation",
          "Forgetting to multiply by carton count",
          "Treating one carton size as if every carton is identical",
          "Leaving out pallets, crates, or protective packaging",
          "Confusing net product weight with gross packed weight",
          "Sending an old packing estimate after the supplier changes the packaging",
        ],
        body: [
          "Ask the supplier for a final packing list or packing summary once production is complete. If the packed volume changes materially, send the updated figures to the forwarder before pickup so the quote can be revised honestly.",
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
          {
            question: "Should I calculate CBM from the product or the carton?",
            answer:
              "Use the final external dimensions of the packed carton, crate, or pallet that will occupy cargo space. Product-only dimensions can understate the shipment once packaging is added.",
          },
          {
            question: "Is the forwarder's measured CBM always the same as my estimate?",
            answer:
              "Not necessarily. Warehouses or carriers may remeasure the packed cargo. Ask how the quote will be adjusted if the final measured volume differs from your estimate.",
          },
        ],
      },
    ],
  },
  {
    slug: "air-cargo-vs-sea-cargo",
    title: "Air Freight vs Sea Freight from China to the Philippines",
    description:
      "Compare air freight, sea freight, courier, LCL, and FCL for China-to-Philippines shipments by speed, cargo size, cost structure, and risk.",
    category: "Shipping Basics",
    status: "published",
    publishedAt: "2026-06-03",
    updatedAt: "2026-07-19",
    keywords: ["air freight vs sea freight", "air cargo vs sea cargo", "china to philippines shipping options", "shipping from china to philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "What Is CBM in Shipping? Formula and Examples",
        href: "/guides/what-is-cbm",
        description: "Use this when you need to estimate size before comparing air and sea options.",
      },
      {
        label: "How to Request a Shipping Quote: A Practical Template",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Ask for both air and sea options when you are still deciding.",
      },
      {
        label: "China-to-Philippines Shipping Cost and Quote Guide",
        href: "/guides/china-to-philippines-shipping-quote",
        description: "Compare the complete quoted scope after you choose possible modes.",
      },
    ],
    sections: [
      {
        heading: "The short version",
        body: [
          "Air cargo is usually faster and more expensive. Sea cargo is usually slower and more cost-efficient for larger shipments.",
          "That is the basic tradeoff, but it is still a simplification. The right choice also depends on urgency, packed size, actual and chargeable weight, cargo type, shipment frequency, destination, customs readiness, and how much delay risk your business can tolerate.",
        ],
      },
      {
        heading: "Know the options you are actually comparing",
        body: [
          "'Air or sea' hides several different service levels. A courier parcel, airport-to-airport air freight, consolidated door-to-door air cargo, LCL sea shipment, and full container shipment do not include the same work or charge in the same way.",
        ],
        bullets: [
          "Express courier: commonly used for samples and smaller parcels, with integrated pickup and delivery depending on the service",
          "Air freight or consolidated air cargo: faster international movement, with scope varying from airport-to-airport to door-to-door",
          "LCL sea freight: your cargo shares container space and is commonly charged by volume, subject to minimums and local charges",
          "FCL sea freight: you use a full container, which can make sense for larger orders but adds container, port, and delivery planning",
        ],
        callout: {
          tone: "info",
          title: "Compare the same delivery scope",
          body:
            "An airport-to-airport or port-to-port quote is not directly comparable with a door-to-door quote. Ask each forwarder to state the pickup point, destination point, customs responsibility, and excluded charges.",
        },
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
          "The margin can absorb a higher freight cost in exchange for faster replenishment.",
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
          "You can plan inventory around a longer and less predictable end-to-end lead time.",
        ],
        callout: {
          tone: "info",
          title: "Do not decide from one vague quote",
          body:
            "If you are unsure, ask for both air and sea options using the same shipment details. Requirements, transit ranges, and pricing logic may vary by cargo type and forwarder.",
        },
      },
      {
        heading: "How packed size and chargeable weight change the decision",
        body: [
          "The air-vs-sea decision becomes easier once you know the approximate carton dimensions, weight, and total CBM. Without that, you are not comparing real options.",
          "A small and dense shipment may still fit air. A light but bulky shipment that seems 'not too many cartons' can become expensive by air once volumetric or chargeable weight is applied. For LCL sea freight, volume and minimum charges can make a very small shipment less economical than expected.",
        ],
        bullets: [
          "Get the carton dimensions, total weight, and carton count first.",
          "Ask whether the quote is based on estimated or confirmed measurements.",
          "Compare both the transit range and the total quote scope.",
          "Check if pickup, warehouse handling, or delivery assumptions differ between the two options.",
        ],
      },
      {
        heading: "Transit time is not the same as total lead time",
        body: [
          "A quoted transit estimate usually describes only part of the journey. Your inventory plan should include the time before departure and after arrival.",
          "Supplier production, China pickup, warehouse receiving, consolidation, space availability, export handling, customs clearance, port or airport release, and final delivery can all add time. Ask for a realistic end-to-end range and the event that starts the clock.",
        ],
        bullets: [
          "Cargo-ready date at the supplier",
          "Pickup and warehouse cutoff",
          "Expected departure, not only booking date",
          "Estimated international transit range",
          "Philippine clearance and release assumptions",
          "Final delivery or provincial transfer",
        ],
      },
      {
        heading: "A practical way to choose",
        steps: [
          "Get final or credible estimated packing details from the supplier.",
          "Write down the date the inventory is actually needed and the cost of arriving late.",
          "Request air and sea quotes using the same origin, destination, cargo, and delivery scope.",
          "Compare total quoted scope, not only the freight line or rate per kilogram or CBM.",
          "Ask what could change the price or schedule after pickup.",
          "Choose the option that protects the business margin and inventory plan, then record the actual result for the next order.",
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
          {
            question: "Which option is best for samples from China?",
            answer:
              "Express courier or air service is often practical for small samples, but compare the full delivered cost and product restrictions. A sample containing batteries, liquids, chemicals, food, or other regulated goods may need different handling or documents.",
          },
          {
            question: "Can I split one order between air and sea?",
            answer:
              "Sometimes. Importers may move an urgent portion by air and the balance by sea, but this creates two shipments, two document sets, and potentially different minimum charges. Ask for the total cost before assuming a split saves money.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-request-a-shipping-quote",
    title: "How to Request a Shipping Quote: A Practical Template",
    description:
      "Use this copy-and-paste freight quote template to give forwarders the cargo, route, timing, and delivery details needed for comparable quotes.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-02",
    updatedAt: "2026-07-19",
    keywords: ["shipping quote request", "freight quote template", "how to ask forwarder for quote", "china to philippines shipping quote"],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "How to Import from China to the Philippines",
        href: "/guides/how-to-import-from-china-to-philippines",
        description: "Use this if you still need the overall beginner workflow first.",
      },
      {
        label: "What Is CBM in Shipping? Formula and Examples",
        href: "/guides/what-is-cbm",
        description: "Use this when you need help estimating dimensions or volume.",
      },
      {
        label: "How to Find China-to-Philippines Freight Forwarders",
        href: "/guides/list-of-forwarders-china-to-philippines",
        description: "Use this when you are deciding how to build a useful forwarder shortlist.",
      },
    ],
    sources: [
      {
        label: "Prohibited and Restricted Importations",
        href: "https://customs.gov.ph/prohibited-restricted-importations/",
        publisher: "Philippine Bureau of Customs",
      },
      {
        label: "Process of Importation",
        href: "https://customs.gov.ph/process-of-importation/",
        publisher: "Philippine Bureau of Customs",
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
          "Supplier cargo-ready date and whether pickup has already been arranged",
          "Your preferred quote currency and requested quote-validity period",
        ],
      },
      {
        heading: "Copy-and-paste shipping quote template",
        body: [
          "Replace every bracketed field. If a figure is not final, label it as estimated instead of leaving the forwarder to guess.",
        ],
        bullets: [
          "Origin or pickup: [supplier address or city in China]",
          "Destination: [city or municipality, province, postal code]",
          "Cargo: [plain-language product description, material, and intended use]",
          "Quantity and packing: [carton, crate, pallet, or piece count]",
          "Dimensions: [length x width x height per package, including unit]",
          "Total volume: [CBM, if known]",
          "Gross weight: [total packed kilograms]",
          "Cargo-ready date: [date or estimated range]",
          "Preferred mode: [air, sea, either, or please recommend]",
          "Delivery scope: [door to door, port or airport, warehouse pickup, or please quote options]",
          "Special handling or regulation concerns: [batteries, liquids, food, electrical goods, fragile cargo, branded goods, or none known]",
          "Please show: [price and currency, transit range, inclusions, exclusions, validity, payment terms, customs responsibility, and insurance option]",
        ],
      },
      {
        heading: "Add the commercial details that affect responsibility",
        body: [
          "The forwarder also needs to understand where the supplier's responsibility ends. If you know the purchase Incoterm, include it. If you do not know it, ask the supplier who pays for and arranges transport from the factory to the agreed China location.",
          "State who will act as importer or consignee in the Philippines and whether you already have a customs broker, importer registration, or product permits. Do not claim that documentation is complete when it is not.",
        ],
        bullets: [
          "Supplier Incoterm or pickup responsibility",
          "Declared commercial value and currency",
          "Importer or consignee arrangement",
          "Known HS or AHTN code, if reviewed by a qualified person",
          "Permits or clearances already obtained or still being checked",
          "Whether cargo insurance should be included as an option",
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
          "Ask how remeasurement, reweighing, inspection, storage, or a classification change would be handled.",
        ],
        callout: {
          tone: "warning",
          body:
            "Do not assume duties, taxes, permits, storage, pickup, or final delivery are covered unless the quote says so clearly. Requirements may vary by shipment.",
        },
      },
      {
        heading: "Compare responses on one checklist",
        body: [
          "Put each response into the same comparison format. If a quote leaves a field blank, treat that as an unanswered question rather than assuming the best case.",
        ],
        bullets: [
          "Total amount, currency, and tax treatment",
          "Service mode and exact origin-to-destination scope",
          "Transit range and when that range starts",
          "Origin, freight, clearance, destination, and delivery inclusions",
          "Duties, taxes, permits, storage, inspection, and other exclusions",
          "Quote validity, payment schedule, and refund or cancellation terms",
          "Cargo insurance coverage or explicit absence of coverage",
          "Assumptions based on estimated dimensions, weight, value, or classification",
        ],
      },
      {
        heading: "A clean beginner workflow",
        steps: [
          "Collect the shipment details from your supplier first.",
          "Prepare one complete request instead of sharing partial details in different chats.",
          "Send the same core request to multiple forwarders.",
          "Compare pricing, transit range, inclusions, exclusions, and follow-up questions.",
          "Clarify unclear assumptions before choosing a forwarder.",
          "Send final packing details and request a revised written quote before pickup if the cargo changed.",
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
          {
            question: "Can I ask for an all-in quote?",
            answer:
              "Yes, but 'all-in' is not specific enough by itself. Ask the forwarder to list every included stage and charge, then state what can still be billed separately.",
          },
          {
            question: "Should I hide the cargo value to get a cheaper quote?",
            answer:
              "No. Give truthful information. Cargo value can affect insurance, documentation, customs assessment, and risk. False or incomplete declarations can create serious clearance and claims problems.",
          },
        ],
      },
    ],
  },
  {
    slug: "list-of-forwarders-china-to-philippines",
    title: "How to Find China-to-Philippines Freight Forwarders",
    description:
      "Build a credible China-to-Philippines forwarder shortlist, verify each candidate, and compare written quotes without trusting a stale directory or paid listing.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-19",
    keywords: ["china to philippines forwarder", "china to philippines forwarders", "freight forwarder philippines", "forwarder list philippines"],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote: A Practical Template",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use the same shipment request when comparing multiple forwarders.",
      },
      {
        label: "Create a free account",
        href: "/sign-up",
        description: "Post one shipment request and receive private quotes in one place.",
      },
      {
        label: "How to Choose a Freight Forwarder in the Philippines",
        href: "/guides/how-to-choose-a-freight-forwarder-philippines",
        description: "Use a due-diligence checklist after building your shortlist.",
      },
    ],
    sections: [
      {
        heading: "There is no honest permanent best-forwarder list",
        body: [
          "A static list goes stale. Companies change services, routes, staff, pricing, account status, and capacity. Some directories are paid placements, and a familiar brand can still be a poor fit for one specific cargo type.",
          "Beginners often waste time looking for the single 'best' forwarder. The real job is building a current shortlist that fits your shipment, then verifying the company and comparing how each candidate responds to the same request.",
        ],
        callout: {
          tone: "warning",
          title: "This guide is not an endorsement list",
          body:
            "Importing Philippines does not guarantee a company merely because it has a public profile, appears in search results, or responds to a request. Verify the provider and the written service terms yourself.",
        },
      },
      {
        heading: "Where to find forwarder candidates",
        body: [
          "Use more than one discovery channel. The goal is not to collect dozens of names; it is to find three to five candidates that actually handle your origin, destination, cargo type, shipment size, and preferred mode.",
        ],
        bullets: [
          "Referrals from importers who shipped similar cargo recently",
          "Public company profiles and quote marketplaces where service coverage is visible",
          "Industry associations, trade events, chambers, and supplier recommendations",
          "Search results for the exact route, mode, and cargo type rather than only 'best forwarder'",
          "Licensed customs brokers or logistics professionals who can explain the required clearance setup",
        ],
      },
      {
        heading: "Verify the company before sending cargo or money",
        body: [
          "A social-media page, warehouse address, or polished website is not enough. Ask for the legal business name, registration details, office and warehouse contacts, written payment instructions, and a named person responsible for your shipment.",
          "Confirm whether the party quoting you is the actual contracting company, an agent, a consolidator, or a salesperson collecting payment for someone else. If customs brokerage is included, ask which licensed customs broker will handle the Philippine declaration and under whose authority.",
        ],
        bullets: [
          "Legal entity name matches the invoice, bank account, and service agreement",
          "Current business registration and verifiable physical contact details",
          "China warehouse address, receiving procedure, and package-identification rules",
          "Named Philippine delivery and customs contacts",
          "Written cargo restrictions, claims process, and insurance options",
          "Official receipt or invoice process and payment terms",
        ],
      },
      {
        heading: "What to compare on a forwarder shortlist",
        bullets: [
          "Whether they commonly handle China-to-Philippines shipments like yours",
          "Whether they accept your exact product and special-handling requirements",
          "How clearly they explain pricing and service coverage",
          "Whether they ask sensible follow-up questions before quoting",
          "Transit ranges and delivery setup",
          "Whether they mention exclusions and document assumptions clearly",
          "Who handles customs, permits, insurance, loss, damage, storage, and claims",
          "How responsive and practical they are before you commit",
        ],
      },
      {
        heading: "A freight forwarder and customs broker are not automatically the same role",
        body: [
          "A freight forwarder coordinates cargo movement and related logistics. A customs broker handles customs declarations and clearance work under the applicable Philippine rules. One company may coordinate both through its own team or a partner, but do not assume the roles are interchangeable.",
          "Ask who is responsible for the goods declaration, what importer registration is being used, and who will answer if Customs requests permits, valuation support, classification details, or a physical examination.",
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
        heading: "Shortlist workflow",
        steps: [
          "Prepare one complete shipment brief with origin, destination, cargo, packing, weight, value, timing, and special handling.",
          "Find three to five candidates with recent experience on a similar China-to-Philippines shipment.",
          "Verify the company identity, service scope, customs arrangement, warehouse instructions, and payment details.",
          "Send the same request to every candidate and require written inclusions, exclusions, validity, and assumptions.",
          "Compare quote quality, responsibility, communication, and risk before price.",
          "Start with a sample or smaller shipment when the supplier, product, or provider relationship is untested.",
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
          {
            question: "How many forwarders should I compare?",
            answer:
              "Three to five credible candidates is usually enough for a first comparison. More names add noise if you have not verified them or cannot compare their scope consistently.",
          },
          {
            question: "Does the lowest per-kilo or per-CBM rate identify the cheapest forwarder?",
            answer:
              "No. Minimum charges, remeasurement, origin fees, customs work, taxes, destination charges, storage, and delivery can change the final amount. Compare the total written scope.",
          },
        ],
      },
    ],
  },
  {
    slug: "china-to-philippines-shipping-quote",
    title: "China-to-Philippines Shipping Cost and Quote Guide",
    description:
      "Understand what drives China-to-Philippines shipping cost, what an all-in quote should show, and how to compare air and sea freight without hidden assumptions.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-07",
    updatedAt: "2026-07-19",
    keywords: [
      "china to philippines shipping quote",
      "china to philippines shipping cost",
      "shipping fee from china to philippines",
      "shipping quote philippines",
      "cargo forwarder philippines quote",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "How to Request a Shipping Quote: A Practical Template",
        href: "/guides/how-to-request-a-shipping-quote",
        description: "Use the same details when asking multiple forwarders to quote.",
      },
      {
        label: "What Is CBM in Shipping? Formula and Examples",
        href: "/guides/what-is-cbm",
        description: "Estimate volume before comparing air and sea cargo options.",
      },
      {
        label: "Create a free account",
        href: "/sign-up",
        description: "Post one request and compare private forwarder quotes.",
      },
      {
        label: "Air Freight vs Sea Freight from China to the Philippines",
        href: "/guides/air-cargo-vs-sea-cargo",
        description: "Choose realistic modes before comparing the final quotes.",
      },
    ],
    sources: [
      {
        label: "Process of Importation",
        href: "https://customs.gov.ph/process-of-importation/",
        publisher: "Philippine Bureau of Customs",
      },
      {
        label: "Philippine Tariff Finder",
        href: "https://tariffcommission.gov.ph/",
        publisher: "Philippine Tariff Commission",
      },
    ],
    sections: [
      {
        heading: "There is no honest universal China-to-Philippines shipping price",
        body: [
          "A rate copied from a post, old quotation, or another importer's shipment is not your price. Freight markets move, and the same carton can cost differently depending on the origin, destination, cargo type, packed size, chargeable weight, service scope, and booking date.",
          "A useful China-to-Philippines shipping quote is a written summary of assumptions about pickup, cargo, mode, customs, delivery, timing, and handling risk. If those assumptions are missing, the headline amount is not safely comparable.",
        ],
        callout: {
          tone: "warning",
          title: "Treat instant estimates as planning numbers",
          body:
            "Do not price your product or pay the supplier from an unconfirmed rate alone. Request a current written quote using the latest packing details and ask what can still change after remeasurement or customs review.",
        },
      },
      {
        heading: "What drives the shipping cost",
        bullets: [
          "China pickup city and distance to the warehouse, airport, or port",
          "Philippine destination and whether inter-island delivery is needed",
          "Express, air freight, consolidated air, LCL sea, or FCL sea mode",
          "Packed dimensions, total CBM, gross weight, and chargeable weight rules",
          "Cargo description, value, classification, brand status, and special handling",
          "Peak season, available capacity, fuel, exchange rate, and quote date",
          "Customs broker, duties, taxes, permits, examination, storage, and clearance scope",
          "Door, warehouse, airport, port, or terminal delivery endpoint",
          "Cargo insurance and declared-value coverage",
        ],
      },
      {
        heading: "Minimum details to send for a current quote",
        bullets: [
          "Supplier or pickup city in China",
          "Cargo description and cargo type",
          "Carton count, total CBM, gross weight, or complete dimensions",
          "Destination city or municipality in the Philippines",
          "Preferred mode: air, sea, either, or not sure",
          "Delivery scope: door delivery, warehouse pickup, or not sure",
          "Special handling notes such as fragile goods, batteries, liquids, or documents",
          "Commercial value, currency, and known Incoterm",
          "Cargo-ready date and required delivery window",
        ],
      },
      {
        heading: "Ask the forwarder to separate the quote into stages",
        body: [
          "You do not need a complicated spreadsheet, but you do need to know what the total covers. A useful quote makes each stage visible or states clearly that it is included.",
        ],
        bullets: [
          "China pickup, receiving, consolidation, documentation, and export handling",
          "International air or sea freight",
          "Philippine customs brokerage and clearance service",
          "Duties, VAT, permits, inspections, and government charges",
          "Port, terminal, warehouse, storage, demurrage, or examination charges",
          "Final delivery, unloading, provincial transfer, or warehouse pickup",
          "Cargo insurance and claims limits",
        ],
      },
      {
        heading: "What 'all-in' should mean in writing",
        body: [
          "'All-in' is useful only when the boundaries are written. Ask for the named origin, named destination, cargo assumptions, included charges, excluded charges, and events that trigger a revision.",
          "Also ask who acts as importer or consignee and who bears additional Customs assessments. A price that includes freight and delivery but excludes duties, taxes, permits, storage, or examinations may still be described casually as door to door.",
        ],
        bullets: [
          "Exact pickup and delivery points",
          "Maximum dimensions, CBM, weight, and declared value covered",
          "Included customs, tax, permit, and brokerage responsibilities",
          "Minimum charge and rounding rules",
          "Remeasurement and reweighing adjustment method",
          "Validity date and booking deadline",
          "Excluded cargo types and surcharge triggers",
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
          "Customs, tax, storage, delivery, and insurance responsibility",
        ],
      },
      {
        heading: "Calculate the landed cost before choosing",
        body: [
          "Shipping cost is not the same as landed cost. Landed cost includes the product and every amount needed to make the goods available at your Philippine destination.",
          "Add the supplier price, China-side charges, international freight, insurance, applicable duty and VAT, brokerage, local handling, storage risk, and final delivery. Divide the final delivered total by the number of saleable units—not the ordered units—when defects or samples reduce sellable inventory.",
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
          {
            question: "What is the cheapest way to ship from China to the Philippines?",
            answer:
              "There is no single cheapest method for every shipment. Sea freight is commonly more economical for larger, non-urgent cargo, while courier or air can make sense for small or urgent shipments. Compare the total delivered scope, minimum charges, and inventory timing.",
          },
          {
            question: "How long should a shipping quote stay valid?",
            answer:
              "There is no universal validity period. Ask the forwarder to state the expiry date, booking deadline, exchange-rate assumption, and which charges remain subject to change.",
          },
          {
            question: "Does a shipping quote include Philippine duties and VAT?",
            answer:
              "Only if the written inclusions say so. Customs duty and tax treatment depends on the product, value, classification, origin documents, and applicable rules. Confirm current tariff information and the service arrangement before shipping.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-freight-forwarder-philippines",
    title: "How to Choose a Freight Forwarder in the Philippines",
    description:
      "A due-diligence checklist for comparing Philippine freight forwarders by legal identity, route fit, written scope, customs setup, insurance, and quote quality.",
    category: "Marketplace Tips",
    status: "published",
    publishedAt: "2026-06-08",
    updatedAt: "2026-07-19",
    keywords: [
      "how to choose freight forwarder philippines",
      "freight forwarder philippines",
      "cargo forwarder philippines",
    ],
    audience: "beginner-importers",
    readingTimeMinutes: 5,
    relatedLinks: [
      {
        label: "How to Find China-to-Philippines Freight Forwarders",
        href: "/guides/list-of-forwarders-china-to-philippines",
        description: "Start with a shortlist, then compare quote quality.",
      },
      {
        label: "China-to-Philippines Shipping Cost and Quote Guide",
        href: "/guides/china-to-philippines-shipping-quote",
        description: "Prepare the request details forwarders need before they quote.",
      },
    ],
    sections: [
      {
        heading: "The cheapest forwarder is not automatically the best choice",
        body: [
          "A forwarder should be judged by how clearly they handle your actual shipment, not by a generic lowest number.",
          "For beginners, the safer comparison is the complete risk-adjusted offer: who you are contracting with, what is included, what is excluded, what timing is realistic, how customs is handled, and what happens if the cargo is delayed, damaged, remeasured, or held for more documents.",
        ],
      },
      {
        heading: "Verify the legal business and payment trail",
        body: [
          "Before sending cargo or money, ask for the provider's legal business name, registration details, business address, official contact channels, invoice process, and payment beneficiary. Those details should agree with one another.",
          "Be cautious when a salesperson asks you to pay an unrelated personal account, refuses to issue a written invoice or receipt, or cannot explain which company is responsible for your cargo. A warehouse label or social-media page is not a service contract.",
        ],
        bullets: [
          "Legal entity and trading name",
          "Current office and warehouse contact details",
          "Bank account or payment channel in the contracting party's name",
          "Written quotation, invoice, receipt, and service terms",
          "Named person accountable for shipment updates and escalation",
        ],
      },
      {
        heading: "Check fit for your actual route and cargo",
        body: [
          "A good general forwarder can still be the wrong provider for your shipment. Confirm recent experience with the origin city, Philippine destination, cargo type, shipment size, and required mode.",
        ],
        bullets: [
          "China pickup city and warehouse receiving procedure",
          "Air, LCL sea, FCL sea, courier, or consolidation experience",
          "Door, port, airport, warehouse, and provincial delivery coverage",
          "Batteries, liquids, food, electrical goods, fragile cargo, branded goods, or other special categories",
          "Small trial shipments versus regular commercial volume",
          "Peak-season capacity and realistic cutoff dates",
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
          "They explain who handles customs and what importer or permit setup they expect.",
          "They provide a written escalation and claims path.",
        ],
      },
      {
        heading: "Make customs responsibility explicit",
        body: [
          "Ask whether the provider is acting as freight forwarder, consolidator, customs broker, delivery provider, or a coordinator using partners. One service may cover several roles, but each role should still have a responsible party.",
          "Confirm the importer or consignee arrangement, the licensed customs broker handling the declaration, required product permits, and who pays duties, taxes, inspections, storage, or additional assessments. Do not proceed on 'bahala na kami' without written scope.",
        ],
      },
      {
        heading: "Ask about cargo insurance and claims before the loss",
        body: [
          "Do not assume the freight price includes full cargo insurance. Carrier liability, forwarder liability, and cargo insurance are different things, and a claim may be limited by the service terms.",
        ],
        bullets: [
          "Whether insurance is included, optional, or unavailable",
          "Declared value, insured risks, deductible, and coverage limit",
          "Packaging and documentation conditions for a valid claim",
          "Deadline and evidence required for loss or damage reporting",
          "Who files the claim and the expected resolution process",
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
          "Payment instructions that do not match the contracting company",
          "Claims that every product can ship with no permit or customs risk",
          "No written cargo restrictions, warehouse procedure, or claims terms",
        ],
      },
      {
        heading: "Use marketplace comparison to reduce guesswork",
        body: [
          "A marketplace does not remove the need for judgment. It gives you a cleaner comparison surface.",
          "When forwarders quote the same request, you can see who is clear, who is vague, who is realistic, and who fits the shipment best.",
        ],
      },
      {
        heading: "Use a controlled first shipment",
        steps: [
          "Verify the company and send the same complete request to your shortlist.",
          "Compare written scope, customs responsibility, insurance, validity, and payment terms.",
          "Choose a smaller or lower-risk first shipment when the supplier or forwarder relationship is new.",
          "Photograph or document the cargo condition and packing before pickup.",
          "Track actual pickup, transit, clearance, delivery, charges, and communication against the quote.",
          "Keep or replace the provider based on the actual result, not the sales promise.",
        ],
      },
      {
        heading: "Questions to ask before choosing",
        faqs: [
          {
            question: "Should I choose a forwarder recommended by my supplier?",
            answer:
              "Treat the recommendation as one candidate, not a final decision. Confirm whose interests the provider represents, verify the company, and compare a written quote with other options.",
          },
          {
            question: "Does door-to-door mean I have no customs responsibility?",
            answer:
              "Not automatically. Ask who is the importer or consignee, who handles the declaration and permits, what duties and taxes are included, and what happens if Customs requires more information or charges.",
          },
          {
            question: "Is a verified badge enough due diligence?",
            answer:
              "No. A status label may confirm only specific information at a point in time. Read what it actually means, then verify the current legal entity, service scope, payment trail, quote, and terms for your shipment.",
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
