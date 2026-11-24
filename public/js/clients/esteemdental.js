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

  /* The opening screen pitches before it asks: the two page plans, side by side. */
  plan: {
    label: "The plan",
    title: "Your site has nine pages today. Here are two ways to rebuild them.",
    lede: "Nine pages, not four. Four are in your menu; the other five are the treatment pages underneath. Google reads five of them as the same page, because they all carry the same title.",
    options: [
      {
        name: "Idea one",
        sub: "The same nine pages",
        note: "Nothing new to write. The same map, rebuilt so each page has a real heading, its own title and its own place on Google.",
        pages: ["Home", "About", "Services", "General Dentistry", "Cosmetic Dentistry", "Implant Dentistry", "Orthodontic", "Oral Surgery", "Find Us"]
      },
      {
        name: "Idea two",
        sub: "Eleven pages",
        pick: "What I would do",
        note: "Everything in idea one, plus the two pages that bring in people who have not heard of you yet.",
        pages: ["Home", "About", "Services", "General Dentistry", "Cosmetic Dentistry", "Implant Dentistry", "Orthodontic", "Oral Surgery", "Find Us",
          { name: "Our Dentists", "new": true, why: "People choose a dentist, not a clinic" },
          { name: "Blog", "new": true, why: "Nine pages can only answer nine questions" }]
      }
    ],
    foot: "Either way, every treatment you offer gets written up properly. That is what the rest of this form is for."
  },

  intro: {
    title: "Help me plan your new website.",
    lede: "Your current site gives each treatment a line or two. The new one gives every treatment, every dentist and every question patients ask its own space. This is where the words come from. I do the writing, you give me the facts.",

    notes: ["Takes about 15 minutes", "Answer what you can. Nothing here is compulsory", "Stop whenever you like. Continue later gives you a link that reopens your answers on any device"]
  },

  /* No "who is filling this in" step: the brief lives on the client's own subdomain,
     so it is already clear whose it is, and I have their numbers. */
  steps: [
    {
      id: "plan", title: "Which one shall we build?",
      lede: "The two plans are on the opening screen. Nothing is locked in, this just tells me where to start.",
      fields: [
        { id: "plan_pick", type: "radio", label: "Pick one",
          options: [
            { label: "Idea one — the same nine pages, rebuilt" },
            { label: "Idea two — eleven pages, with Our Dentists and a Blog" },
            { label: "Not sure yet, let us talk it through" }
          ] },
        { id: "plan_pages", type: "textarea", rows: 3, label: "Any page you want added, dropped or renamed?",
          placeholder: "e.g. Drop Oral Surgery and put it under General. Add a page just for All-on-4. Call it Our Team instead of Our Dentists." }
      ]
    },

    {
      id: "home", title: "Your homepage",
      lede: "The words at the top of the page. Give me the idea in your own words and I will polish it.",
      quote: { label: "Your homepage says today", text: "Modern dental clinic offering comprehensive, comfortable care" },
      fields: [
        { id: "home_h1", type: "textarea", rows: 2, label: "Main headline", hint: "The one thing a first-time visitor should understand in five seconds.",
          placeholder: "Something like: Dentistry done properly, in Seri Kembangan. Or: The dental clinic your family keeps coming back to." },
        { id: "home_h2", type: "textarea", rows: 2, label: "The line under it", hint: "One or two sentences that back the headline up.",
          placeholder: "Something like: From a routine scaling to a full set of implants, the same team looks after you from the first visit to the last. Open seven days." },
        { id: "home_reasons", type: "list", count: 3, label: "Three things every visitor should know about Esteem", placeholder: ["e.g. Every step explained before we start",
                        "e.g. Crowns milled here, most fitted the same day",
                        "e.g. The dentist who plans your case is the one who does it"] },
        { id: "home_focus", type: "chips", label: "Which treatments should get the most space?", hint: "Pick up to three. These sit highest on the homepage.", max: 3,
          options: ["Dental implants", "All-on-4 / All-on-6", "Clear aligners", "Braces", "Veneers", "Teeth whitening", "One-day crown", "Smile makeover", "Wisdom tooth removal", "Scaling and polishing", "Check-ups"] },
        { id: "home_numbers", type: "textarea", rows: 3, label: "Numbers you are happy to show on the site",
          placeholder: "Opened 2015\n4 dentists\n12,000 patients\n4.9 from 320 Google reviews",
          hint: "One per line. Year opened, how many dentists, patients treated, implants placed, your Google rating. Roughly is fine, and skip any you would rather leave off. I print them exactly as you write them." },
        { id: "home_button", type: "radio", label: "What should the main button do?",
          options: [{ label: "Open WhatsApp" }, { label: "Call the clinic" }, { label: "Open our online booking system", more: "Link to the booking system" }, { label: "Open a booking form on the website" }] },
        { id: "home_extra", type: "textarea", rows: 3, label: "Anything else you want on the homepage?",
          placeholder: "e.g. A section on our Megagen R2Gate centre. A note that we are open on Sundays. The video we made for Hari Raya." }
      ]
    },

    {
      id: "story", title: "The story of Esteem",
      lede: "This becomes the About page. Short answers are fine.",
      fields: [
        { id: "story_start", type: "textarea", rows: 4, label: "When did Esteem open, and why?", hint: "Who started it, and what they wanted to do differently from other clinics.",
          placeholder: "e.g. We opened in 2016. Dr X had spent years in a clinic where every patient was given fifteen minutes, and wanted somewhere people could be talked through their options without feeling rushed. We started with two chairs and one dentist." },
        { id: "story_comfort", type: "textarea", rows: 4, label: "Your site promises “extra comfort, at no extra cost”. What does that look like on a visit?", hint: "The small things a patient would notice.",
          placeholder: "e.g. Numbing gel goes on before every injection, so the needle is not felt. We show the X-ray on the screen and explain what we are looking at before we touch anything. There is a blanket if the room is cold." },
        { id: "story_langs", type: "chips", label: "Languages your team speaks", options: ["English", "Bahasa Melayu", "Mandarin", "Cantonese", "Hokkien", "Tamil"], other: "Other languages" },
        { id: "story_facilities", type: "chips", label: "What do you have at the clinic?", options: ["Parking nearby", "Wheelchair access", "Child-friendly", "Wi-Fi", "Private consultation room"], other: "Something else" },
        { id: "story_pay", type: "chips", label: "How can patients pay?", options: ["Cash", "Card", "DuitNow QR or e-wallet", "Instalment plan", "Insurance or company panel"], other: "Other" },
        { id: "story_panels", type: "text", label: "Which insurers or panel companies do you accept?", hint: "Skip if none.", placeholder: "AIA, Great Eastern, Allianz, company panels" }
      ]
    },

    {
      id: "team", title: "Your dentists",
      lede: "Patients want to know who will treat them. Add one card per dentist. Photos go in the last section.",
      fields: [
        { id: "team_dentists", type: "repeat", min: 1, max: 10, item: "Dentist", add: "Add another dentist",
          fields: [
            { id: "name", type: "text", label: "Name as it should appear", placeholder: "Dr Amirah Hassan", half: true },
            { id: "quals", type: "text", label: "Qualifications", placeholder: "BDS (Universiti Malaya) 2012", half: true, hint: "Exactly as registered, so the titles on the site stay accurate." },
            { id: "does", type: "text", label: "Treatments they do most", placeholder: "Implants and full arch cases", half: true },
            { id: "line", type: "textarea", rows: 2, label: "A line in their own words", hint: "Why they became a dentist, or what patients say about them.",
              placeholder: "e.g. I had a bad experience at the dentist as a child and spent years avoiding it. I would rather no one else had to." }
          ] },
        { id: "team_rest", type: "radio", label: "Show the rest of the team on the site?",
          options: [{ label: "Yes, with a group photo" }, { label: "Yes, with names and roles" }, { label: "No, dentists only" }] }
      ]
    },

    {
      id: "treat", title: "Treatments",
      lede: "Right now each treatment gets a line or two. On the new site the main ones get a page each, so this is where most of the writing comes from.",
      fields: [
        { id: "treat_pick", type: "cards", label: "Tick the treatments that should get their own page", hint: "Then open each one. Three boxes each, a few words per box.",
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
            { id: "who", type: "textarea", rows: 2, label: "Who is it for, and what does it fix?",
              placeholder: "e.g. For anyone missing one tooth or several. An implant replaces the root, so the new tooth is fixed in place and the bone around it stops shrinking." },
            { id: "steps", type: "textarea", rows: 3, label: "What happens, from the first visit to the last?", hint: "How many visits, how long each takes, how long to heal.",
              placeholder: "e.g. First visit is a scan and a plan, about an hour. The implant goes in on the second visit, under local, about 45 minutes. Then three to four months to heal before the crown is fitted on the third visit." },
            { id: "asks", type: "textarea", rows: 2, label: "What do patients always ask about it?", hint: "Their questions, your answers. These become the page's own Q and A.",
              placeholder: "e.g. Does it hurt? No, the area is numb and most people go back to work the next day. How long does it last? Twenty years and more if it is kept clean." }
          ] },
        { id: "treat_price", type: "radio", label: "How should prices read across the site?", hint: "Asked once, applied everywhere. I can still do it differently on one page if you say so.",
          options: [{ label: "Show a starting price for each treatment" }, { label: "Say the price comes after a consultation" }, { label: "Leave prices off the site" }] },
        { id: "treat_diff", type: "textarea", rows: 3, label: "What do you do differently from the clinic down the road?", hint: "Equipment, brands, materials, an in-house lab, how long you take over a case. One answer is fine, it runs through every treatment page.",
          placeholder: "e.g. Every implant case is planned on a 3D scan first, so the position is decided before anyone picks up a drill. We mill our own crowns, so most are fitted the same day instead of two weeks later." }
      ]
    },

    {
      id: "proof", title: "Your equipment and your reviews",
      lede: "The proof that goes on the site. Tick, paste, and move on.",
      quote: { label: "Your Services page says today", text: "Esteem Dental Clinic is the only Megagen R2Gate implant centre in Malaysia" },
      fields: [
        { id: "proof_r2gate", type: "radio", label: "Is that line still true today?",
          options: [{ label: "Yes, keep it" }, { label: "It needs updating", more: "How should it read now?" }, { label: "Not sure" }] },
        { id: "proof_tech", type: "chips", label: "Which of these do you use?", hint: "Tick only what you have. I will explain each one in plain words.",
          options: ["R2Gate guided implant surgery", "Digital implant planning", "Dynamic navigation", "3D CBCT scan", "Intraoral scanner", "Digital X-ray", "In-house clear aligners", "Same-day crowns (CAD/CAM)"], other: "Other equipment" },
        { id: "proof_awards", type: "textarea", rows: 3, label: "Awards, certificates, memberships or media features", hint: "With the year if you have it. Skip if there are none.",
          placeholder: "e.g. Member, Malaysian Dental Association\nMegagen R2Gate certified centre, 2021\nFeatured in Harian Metro, March 2023" },
        { id: "proof_google", type: "url", label: "Link to your Google Business Profile", placeholder: "https://" },
        { id: "proof_reviews", type: "textarea", rows: 5, label: "Paste three to five reviews you love", hint: "From Google, Facebook or WhatsApp. Paste them exactly as written, typos and all. I quote them word for word, with first names only.",
          placeholder: "Paste them straight in, one per line. For example:\n\n“I was terrified of the dentist for years. Dr explained everything first and I did not feel a thing.” — Siti, Google\n\n“Got my crown done in one day. Walked in at 10, walked out with a new tooth.” — Kumar, Google" },
        { id: "proof_cases", type: "radio", label: "Can we show before and after cases?",
          options: [{ label: "Yes, we have patient consent" }, { label: "Some, we need to ask patients" }, { label: "Not for now" }] }
      ]
    },

    {
      id: "faq", title: "Questions patients ask",
      lede: "The ones your team answers on WhatsApp every week. Three is enough to start.",
      fields: [
        { id: "faq_items", type: "repeat", min: 3, max: 20, item: "Question", add: "Add another question", compact: true,
          fields: [
            { id: "q", type: "text", label: "Question", placeholder: "Do you take walk-ins?" },
            { id: "a", type: "textarea", rows: 2, label: "Your usual answer",
              placeholder: "e.g. We do, but an appointment is safer. Walk-ins are seen when there is a gap, and on Saturdays that can mean a long wait." }
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
        { id: "visit_holidays", type: "text", label: "Are you open on public holidays?", placeholder: "Closed on public holidays, open as usual the next day" },
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
        { id: "visit_domain", type: "textarea", rows: 2, label: "Who looks after your domain and hosting today?", hint: "Your current site was built by Omna Studio. Do you still work with them, and who has the domain login?",
          placeholder: "e.g. Omna Studio built it and still hosts it. Our manager has the login. Or just: not sure, we will find out." }
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
        { id: "look_refs", type: "repeat", min: 1, max: 6, item: "Website", add: "Add another website", compact: true,
          label: "Websites you like", hint: "Dental or not. Tell me what you like about each one.",
          fields: [
            { id: "url", type: "url", label: "Link", placeholder: "https://" },
            { id: "why", type: "text", label: "What you like about it", placeholder: "Clean, lots of white space, easy to find the treatments" }
          ] },
        { id: "look_keep", type: "textarea", rows: 2, label: "Anything on the current site you want to keep?",
          placeholder: "e.g. The logo and the colours. The photo of the reception. The way the treatments are grouped." },
        { id: "look_avoid", type: "textarea", rows: 2, label: "Anything you do not want on the new site?",
          placeholder: "e.g. No stock photos of models with perfect teeth. Nothing that pops up over the page. No before and after photos on the homepage." }
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
      { id: "end_more", type: "textarea", rows: 3, label: "Anything else I should know?",
        placeholder: "e.g. We are adding a second branch next year. Dr X is away until February. We would like the site up before Raya." },
      { id: "end_ok", type: "consent", required: true, label: "We are happy for Shazwan Sites to use these answers and files to plan and build our website." }
    ]
  },

  done: {
    title: "Thank you. Everything is in.",
    lede: "I will read through it and come back to you with a page plan and the first homepage draft."
  }
};
