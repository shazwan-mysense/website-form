/* Esteem Dental: website revamp brief.
   Every question lives here; js/brief.js only knows how to draw and save them.
   Facts quoted from the live site (esteemdentalclinic.com, read 24 Nov 2026) are shown
   back to the clinic to confirm, never assumed.
   Brand guide: do not use the words specialist, specialized, expert, experienced, focus, lead. */
window.BRIEF = {
  client: "esteemdental",
  name: "Esteem Dental",
  doc: "Website brief",
  by: "Shazwan Sites",
  contact: { email: "zebwan00@gmail.com", whatsapp: "" },
  maxMB: 50,
  /* the lockup from mhdshazwn.com, with the clinic named underneath */
  mark: '<span class="mark"><span class="n">Shazwan&#169;</span><span class="s">Esteem Dental</span></span>',

  intro: {
    title: "Help me plan your new website.",
    lede: "Your current site has four pages, with a few lines for each treatment. The new one gives every treatment, every dentist and every question patients ask its own space. I write the words; you give me the facts.",
    pages: ["Home", "About Esteem", "Our dentists", "A page for each treatment", "Technology", "Patient stories", "Questions patients ask", "Find us and book"],
    notes: ["Takes about 20 minutes", "Answer what you can. Nothing here is compulsory", "Stop whenever you like. Continue later gives you a link that reopens your answers on any device"]
  },

  /* No "who is filling this in" step: the brief lives on the client's own subdomain,
     so it is already clear whose it is, and I have their numbers. */
  steps: [
    {
      id: "goals", title: "What should the new site do?",
      lede: "This decides what goes at the top of every page.",
      fields: [
        { id: "goals_better", type: "chips", label: "What should it do better than the current site?", hint: "Pick as many as you like.",
          options: ["Bring in more bookings", "Explain each treatment properly", "Show up on Google for treatments near us", "Introduce our dentists", "Show real results and reviews", "Answer questions before patients WhatsApp us", "Look more modern and premium"], other: "Something else" },
        { id: "goals_treatments", type: "chips", label: "Which treatments do you want more patients for?", hint: "Pick up to three. These get the most space on the homepage.", max: 3,
          options: ["Dental implants", "All-on-4 / All-on-6", "Clear aligners", "Braces", "Veneers", "Teeth whitening", "One-day crown", "Smile makeover", "Wisdom tooth removal", "Scaling and polishing", "Check-ups"] },
        { id: "goals_patients", type: "chips", label: "Who are most of your patients?",
          options: ["Families with children", "Working adults", "Seniors", "Students", "Patients who are nervous about the dentist", "Patients coming for implants or bigger cases"], other: "Someone else" },
        { id: "goals_areas", type: "chips", label: "Where do most patients travel from?", hint: "These help the right people find you on Google.",
          options: ["Seri Kembangan", "Serdang", "Balakong", "Puchong", "Putrajaya", "Cyberjaya", "Kajang", "Bangi", "Cheras", "Kuala Lumpur"], other: "Other areas" },
        { id: "goals_rivals", type: "textarea", rows: 2, label: "Which clinics do patients compare you with?", hint: "Names or websites. I will look at what they do well, and do it better." }
      ]
    },

    {
      id: "home", title: "Your homepage",
      lede: "Give me the idea in your own words. I will polish the wording.",
      quote: { label: "Your homepage says today", text: "Modern dental clinic offering comprehensive, comfortable care" },
      fields: [
        { id: "home_h1", type: "textarea", rows: 2, label: "Main headline", hint: "The one thing a first-time visitor should understand in five seconds." },
        { id: "home_h2", type: "textarea", rows: 2, label: "The line under it", hint: "One or two sentences that back the headline up." },
        { id: "home_reasons", type: "list", count: 3, label: "Three reasons patients pick Esteem over another clinic", placeholder: ["First reason", "Second reason", "Third reason"] },
        { id: "home_year", type: "text", label: "Year the clinic opened", half: true, inputmode: "numeric" },
        { id: "home_dentists", type: "text", label: "Number of dentists", half: true, inputmode: "numeric" },
        { id: "home_patients", type: "text", label: "Patients treated so far", half: true, placeholder: "Roughly is fine" },
        { id: "home_implants", type: "text", label: "Implants placed so far", half: true, placeholder: "Roughly is fine" },
        { id: "home_rating", type: "text", label: "Google rating and number of reviews", placeholder: "For example 4.9 from 320 reviews", hint: "Only numbers you are happy to see on the site. I show them exactly as written." },
        { id: "home_button", type: "radio", label: "What should the main button do?",
          options: [{ label: "Open WhatsApp" }, { label: "Call the clinic" }, { label: "Open our online booking system", more: "Link to the booking system" }, { label: "Open a booking form on the website" }] },
        { id: "home_extra", type: "textarea", rows: 3, label: "Anything else you want on the homepage?" }
      ]
    },

    {
      id: "story", title: "The story of Esteem",
      lede: "This becomes the About page. Short answers are fine.",
      fields: [
        { id: "story_start", type: "textarea", rows: 4, label: "When did Esteem open, and why?", hint: "Who started it, and what they wanted to do differently from other clinics." },
        { id: "story_comfort", type: "textarea", rows: 4, label: "Your site promises “extra comfort, at no extra cost”. What does that look like on a visit?", hint: "The small things patients notice. For example numbing gel before an injection, explaining each step first, a blanket, music or TV." },
        { id: "story_words", type: "text", label: "Describe the clinic in three words" },
        { id: "story_langs", type: "chips", label: "Languages your team speaks", options: ["English", "Bahasa Melayu", "Mandarin", "Cantonese", "Hokkien", "Tamil"], other: "Other languages" },
        { id: "story_facilities", type: "chips", label: "What do you have at the clinic?", options: ["Parking nearby", "Wheelchair access", "Child-friendly", "Wi-Fi", "Private consultation room"], other: "Something else" },
        { id: "story_pay", type: "chips", label: "How can patients pay?", options: ["Cash", "Card", "DuitNow QR or e-wallet", "Instalment plan", "Insurance or company panel"], other: "Other" },
        { id: "story_panels", type: "text", label: "Which insurers or panel companies do you accept?", hint: "Skip if none." }
      ]
    },

    {
      id: "team", title: "Your dentists",
      lede: "Patients want to know who will treat them. Add one card per dentist. Photos go in the last section.",
      fields: [
        { id: "team_dentists", type: "repeat", min: 1, max: 10, item: "Dentist", add: "Add another dentist",
          fields: [
            { id: "name", type: "text", label: "Name as it should appear", placeholder: "Dr" , half: true },
            { id: "quals", type: "text", label: "Qualifications", placeholder: "Degree, university, year", half: true, hint: "Exactly as registered, so the titles on the site stay accurate." },
            { id: "does", type: "text", label: "Treatments they do most", half: true },
            { id: "langs", type: "text", label: "Languages", half: true },
            { id: "line", type: "textarea", rows: 2, label: "A line in their own words", hint: "Why they became a dentist, or what patients say about them." }
          ] },
        { id: "team_rest", type: "radio", label: "Show the rest of the team on the site?",
          options: [{ label: "Yes, with a group photo" }, { label: "Yes, with names and roles" }, { label: "No, dentists only" }] }
      ]
    },

    {
      id: "treat", title: "Treatments",
      lede: "Your Services page lists every treatment in a line or two. On the new site each main treatment gets its own page, which helps patients decide and helps Google send them to you.",
      fields: [
        { id: "treat_pick", type: "cards", label: "Tick the treatments that should get their own page", hint: "Then open each one and answer what you can. A few words per box is plenty.",
          groups: [
            { name: "General", items: ["Check-up and consultation", "Scaling and polishing"] },
            { name: "Oral surgery", items: ["Tooth extraction", "Wisdom tooth removal"] },
            { name: "Implants", items: ["Dental implants", "All-on-4 / All-on-6"] },
            { name: "Braces", items: ["Metal braces", "Self-ligating braces", "Clear aligners"] },
            { name: "Cosmetic", items: ["Teeth whitening", "Veneers", "One-day crown", "Smile makeover"] },
            { name: "Others", items: ["Bruxism (teeth grinding)", "Occlusal equilibration", "Movie props"] }
          ],
          other: "Add a treatment that is not listed",
          fields: [
            { id: "who", type: "textarea", rows: 2, label: "Who is it for, and what problem does it fix?" },
            { id: "steps", type: "textarea", rows: 3, label: "What happens, step by step?", hint: "How many visits, and roughly how long each one takes." },
            { id: "feel", type: "textarea", rows: 2, label: "Does it hurt? How long is recovery?" },
            { id: "diff", type: "textarea", rows: 2, label: "What is different about how Esteem does it?", hint: "Equipment, brands, materials, an in-house lab." },
            { id: "price", type: "radio", label: "Price on the website",
              options: [{ label: "Show a starting price", more: "From RM" }, { label: "Price after consultation" }, { label: "Do not mention price" }] },
            { id: "asks", type: "textarea", rows: 2, label: "What do patients usually ask about it?" },
            { id: "ba", type: "radio", label: "Before and after photos with patient consent?", options: [{ label: "Yes" }, { label: "Some, need to ask" }, { label: "No" }] }
          ] }
      ]
    },

    {
      id: "proof", title: "Technology and proof",
      lede: "The things that make a nervous patient trust you before they walk in.",
      quote: { label: "Your Services page says today", text: "Esteem Dental Clinic is the only Megagen R2Gate implant centre in Malaysia" },
      fields: [
        { id: "proof_r2gate", type: "radio", label: "Is that line still true today?",
          options: [{ label: "Yes, keep it" }, { label: "It needs updating", more: "How should it read now?" }, { label: "Not sure" }] },
        { id: "proof_tech", type: "chips", label: "Which of these do you use?", hint: "Tick only what you have. I will explain each one in plain words.",
          options: ["R2Gate guided implant surgery", "Digital implant planning", "Dynamic navigation", "3D CBCT scan", "Intraoral scanner", "Digital X-ray", "In-house clear aligners", "Same-day crowns (CAD/CAM)"], other: "Other equipment" },
        { id: "proof_awards", type: "textarea", rows: 3, label: "Awards, certificates, memberships or media features", hint: "With the year if you have it." },
        { id: "proof_google", type: "url", label: "Link to your Google Business Profile", placeholder: "https://" },
        { id: "proof_reviews", type: "textarea", rows: 5, label: "Paste three to five reviews you love", hint: "From Google, Facebook or WhatsApp. I quote them word for word, with first names only." },
        { id: "proof_cases", type: "radio", label: "Can we show before and after cases?",
          options: [{ label: "Yes, we have patient consent" }, { label: "Some, we need to ask patients" }, { label: "Not for now" }] }
      ]
    },

    {
      id: "faq", title: "Questions patients ask",
      lede: "The questions your team answers on WhatsApp every week. On the site they save you time and help with Google.",
      fields: [
        { id: "faq_items", type: "repeat", min: 3, max: 20, item: "Question", add: "Add another question", compact: true,
          fields: [
            { id: "q", type: "text", label: "Question", placeholder: "For example: Do you take walk-ins?" },
            { id: "a", type: "textarea", rows: 2, label: "Your usual answer" }
          ] }
      ]
    },

    {
      id: "visit", title: "Booking and clinic details",
      lede: "Copied from your current site. Please check each one.",
      fields: [
        { id: "visit_address", type: "radio", label: "Address",
          quote: "7-G & 8-G, Block D, Pusat Perniagaan, Jalan Atmosphere 7, The Atmosphere, 43300 Seri Kembangan, Selangor",
          options: [{ label: "Correct" }, { label: "Change it", more: "Address as it should appear" }] },
        { id: "visit_hours", type: "radio", label: "Opening hours",
          quote: "Monday to Sunday, 9am to 1pm and 2pm to 5pm",
          options: [{ label: "Correct" }, { label: "Change it", more: "Opening hours" }] },
        { id: "visit_holidays", type: "text", label: "Are you open on public holidays?" },
        { id: "visit_phones", type: "radio", label: "Which number should patients WhatsApp?",
          quote: "+60 19 857 8829 and +60 3 8940 9393",
          options: [{ label: "+60 19 857 8829" }, { label: "Another number", more: "WhatsApp number" }] },
        { id: "visit_email", type: "radio", label: "Email for enquiries",
          quote: "info@esteemdentalclinic.com",
          options: [{ label: "Correct" }, { label: "Change it", more: "Email" }] },
        { id: "visit_book", type: "chips", label: "How do patients book today?", options: ["WhatsApp", "Phone call", "Walk-in", "Online booking system"], other: "Other" },
        { id: "visit_ig", type: "url", label: "Instagram", placeholder: "https://", half: true },
        { id: "visit_fb", type: "url", label: "Facebook", placeholder: "https://", half: true },
        { id: "visit_tt", type: "url", label: "TikTok", placeholder: "https://", half: true },
        { id: "visit_xhs", type: "url", label: "Xiaohongshu", placeholder: "https://", half: true },
        { id: "visit_langs", type: "radio", label: "Which languages should the website be in?",
          options: [{ label: "English only" }, { label: "English and Bahasa Melayu" }, { label: "English, Bahasa Melayu and Chinese" }] },
        { id: "visit_domain", type: "textarea", rows: 2, label: "Who looks after your domain and hosting today?", hint: "Your current site was built by Omna Studio. Do you still work with them, and who has the domain login?" }
      ]
    },

    {
      id: "look", title: "Look and feel",
      lede: "How the new site should feel when someone opens it.",
      fields: [
        { id: "look_guide", type: "radio", label: "Brand guide", hint: "I have the guide you shared for the All-on-X page: cream, warm brown and the Prata typeface.",
          options: [{ label: "Still the same" }, { label: "Some things changed", more: "What changed? Upload the new guide in the last section." }, { label: "We would like a fresh look" }] },
        { id: "look_words", type: "chips", label: "Pick up to three words for the feel", max: 3,
          options: ["Calm", "Warm", "Premium", "Friendly", "Modern", "Clean", "Gentle", "Family", "Bright", "Confident"] },
        { id: "look_refs", type: "repeat", min: 2, max: 6, item: "Website", add: "Add another website", compact: true,
          label: "Websites you like", hint: "Dental or not. Tell me what you like about each one.",
          fields: [
            { id: "url", type: "url", label: "Link", placeholder: "https://" },
            { id: "why", type: "text", label: "What you like about it" }
          ] },
        { id: "look_keep", type: "textarea", rows: 2, label: "Anything on the current site you want to keep?" },
        { id: "look_avoid", type: "textarea", rows: 2, label: "Anything you do not want on the new site?" }
      ]
    },

    {
      id: "files", title: "Photos and files",
      lede: "Real photos of your clinic and team make the biggest difference. Phone photos are fine if they are sharp and well lit.",
      fields: [
        { id: "files_have", type: "chips", label: "Which of these can you send?", hint: "Tick what you have. It tells me what to plan around.",
          options: ["Clinic entrance and signage", "Reception and waiting area", "Treatment rooms", "Equipment", "A portrait of each dentist", "Team photo", "Before and after cases", "Logo files", "Brand guide"] },
        { id: "files_upload", type: "files", label: "Upload photos or a zip file", hint: "Up to 50 MB in total. Anything bigger is easier as a link, below." },
        { id: "files_drive", type: "url", label: "Link to your materials", placeholder: "https://drive.google.com/",
          hint: "Google Drive, Dropbox, WeTransfer, a shared photo album, whatever you already use. Send me everything you have and I will pick what works: clinic photos, treatment photos, videos, logo files, old brochures, posters, anything from your socials. Nothing needs sorting first. Please set sharing to “Anyone with the link” so it opens." },
        { id: "files_notes", type: "textarea", rows: 2, label: "Anything I should know about what is in there", placeholder: "Which photos you like, what not to use, who is in them" }
      ]
    }
  ],

  review: {
    title: "Ready to send",
    lede: "Check the sections below. Anything you skipped can be sorted out on a call.",
    fields: [
      { id: "end_when", type: "radio", label: "When would you like the new site to go live?", options: [{ label: "Within a month" }, { label: "In one to two months" }, { label: "In three months or more" }, { label: "No fixed date" }] },
      { id: "end_more", type: "textarea", rows: 3, label: "Anything else I should know?" },
      { id: "end_ok", type: "consent", required: true, label: "We are happy for Shazwan Sites to use these answers and files to plan and build our website." }
    ]
  },

  done: {
    title: "Thank you. Everything is in.",
    lede: "I will read through it and come back to you with a page plan and the first homepage draft."
  }
};
