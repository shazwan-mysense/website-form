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
  maxMB: 500,
  maxFileMB: 95,
  /* the lockup from mhdshazwn.com */
  mark: '<span class="mark"><span class="n">Shazwan&#169;</span><span class="s">Sites</span></span>',

  /* The opening screen pitches before it asks: the page plan, with the add-ons beside it. */
  plan: {
    label: "The plan",
    title: "Nine pages, rebuilt from the ground up.",
    lede: "Nine, not four. Four are in your menu; the other five are the treatment pages underneath. Google reads five of them as the same page, because they all carry the same title. Same map, rebuilt properly.",
    options: [
      {
        name: "The revamp",
        sub: "The same nine pages",
        note: "Nothing new for you to write. Every page gets a real heading, its own title, its own words and its own place on Google.",
        pages: ["Home", "About", "Services", "General Dentistry", "Cosmetic Dentistry", "Implant Dentistry", "Orthodontic", "Oral Surgery", "Find Us"]
      }
    ],
    foot: "Either way, every treatment you offer gets written up properly. That is what the rest of this form is for."
  },

  intro: {
    title: "Help me plan your new website.",
    lede: "Your current site gives each treatment a line or two. The new one gives every treatment, every dentist and every question patients ask its own space. This is where the words come from. I do the writing, you give me the facts.",

    notes: ["Takes about 10 minutes", "Answer what you can. Nothing here is compulsory", "Stop whenever you like. Continue later gives you a link that reopens your answers on any device"]
  },

  /* No "who is filling this in" step: the brief lives on the client's own subdomain,
     so it is already clear whose it is, and I have their numbers. */
  steps: [
    {
      id: "pages", title: "The nine pages",
      lede: "The plan is on the opening screen. Nine pages is a starting point, not a rule.",
      fields: [
        { id: "add_pages", type: "textarea", rows: 3, label: "Any page you want added, dropped or renamed?",
          placeholder: "e.g. Drop Oral Surgery and put it under General. Add a page just for All-on-4. We would like a page for each dentist." }
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
        { id: "home_numbers", type: "textarea", rows: 3, label: "Numbers you are happy to show on the site",
          placeholder: "Opened 2015\n4 dentists\n12,000 patients\n4.9 from 320 Google reviews",
          hint: "One per line. Year opened, how many dentists, patients treated, implants placed, your Google rating. Roughly is fine, and skip any you would rather leave off. I print them exactly as you write them." },
        { id: "home_button", type: "radio", label: "What should the main button do?",
          options: [{ label: "Open WhatsApp" }, { label: "Call the clinic" }, { label: "Open our online booking system", more: "Link to the booking system" }, { label: "Open a booking form on the website" }] },
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
        { id: "story_facilities", type: "chips", label: "What do you have at the clinic?", options: ["Parking nearby", "Wheelchair access", "Child-friendly", "Wi-Fi", "Private consultation room"], other: "Something else" },
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
      lede: "This is where most of the writing comes from. Write as much or as little as you like, in your own words. I do the tidying.",
      fields: [
        { id: "treat_star", type: "textarea", rows: 3, label: "Which treatments should stand out?",
          hint: "The ones you would rather fill your diary with. These sit highest on the homepage and get the most room.",
          placeholder: "e.g. Implants and All-on-4 first, then clear aligners. Whitening and scaling can sit further down." },
        { id: "treat_all", type: "textarea", rows: 12, label: "Tell me about your treatments",
          hint: "One treatment at a time, in any order. For each one: who it is for, what happens from the first visit to the last, and what patients always ask about it. Rough notes are fine.",
          placeholder: "Dental implants\nFor anyone missing one tooth or several. First visit is a scan and a plan, about an hour. The implant goes in on the second visit, under local, about 45 minutes. Three to four months to heal, then the crown is fitted. Patients always ask if it hurts, it does not, the area is numb and most go back to work the next day.\n\nClear aligners\nFor adults who do not want metal braces. ..." },
        { id: "treat_diff", type: "textarea", rows: 3, label: "What do you do differently from the clinic down the road?", hint: "Equipment, brands, materials, an in-house lab, how long you take over a case. One answer is fine, it runs through every treatment page.",
          placeholder: "e.g. Every implant case is planned on a 3D scan first, so the position is decided before anyone picks up a drill. We mill our own crowns, so most are fitted the same day instead of two weeks later." }
      ]
    },

    {
      id: "kit", title: "Your equipment",
      lede: "The machines are only worth a mention if the patient can tell what they get out of them. Tell me what you have and I will write that part.",
      fields: [
        { id: "kit_line", type: "radio", label: "Your Services page carries this line. Keep it on the new site?",
          quote: "Esteem Dental Clinic is the only Megagen R2Gate implant centre in Malaysia",
          options: [{ label: "Keep it as it is" }, { label: "Keep it, but word it differently", more: "How should it read?" }, { label: "Leave it off" }] },
        { id: "kit_items", type: "repeat", min: 1, max: 12, item: "Equipment", add: "Add another piece of equipment", compact: true,
          label: "Any equipment you want people to know you use?",
          hint: "Skip it if you would rather not list any.",
          fields: [
            { id: "name", type: "text", label: "What is it", ex: true, placeholder: [
              "Megagen R2Gate guided implant surgery",
              "3D CBCT scanner",
              "Intraoral scanner",
              "Same-day crown milling machine",
              "Digital X-ray"
            ] },
            { id: "good", type: "textarea", rows: 2, label: "What does it mean for the patient", placeholder: [
              "e.g. The implant position is planned on a 3D scan and placed through a guide, so it goes exactly where we decided. Less cutting, less swelling, and you are back to normal faster.",
              "e.g. We see the bone in three dimensions before we touch anything, so there are no surprises halfway through.",
              "e.g. No putty, no gagging. A small camera takes the impression in a few minutes.",
              "e.g. The crown is milled here, so most people walk out with the finished tooth the same day instead of waiting two weeks.",
              "e.g. Far less radiation than old film, and the image is on the screen beside you while we explain it."
            ] }
          ] }
      ]
    },

    {
      id: "faq", title: "Questions patients ask",
      lede: "The ones your team answers on WhatsApp every week. Three is enough to start.",
      fields: [
        { id: "faq_items", type: "repeat", min: 3, max: 20, item: "Question", add: "Add another question", compact: true,
          fields: [
            /* a fresh suggestion on every row, so a blank mind still has somewhere to go */
            { id: "q", type: "text", label: "Question", ex: true, placeholder: [
              "Do you take walk-ins?",
              "How much is a scaling and polishing?",
              "Do you see children?",
              "Can I pay in instalments?",
              "I am nervous about the dentist. What do you do about that?",
              "How long does a whitening appointment take?",
              "Do I need a referral for implants?",
              "Is the first consultation charged?",
              "Can I claim through my company panel?",
              "How often should I come for a check-up?",
              "Do I have to be put to sleep for a wisdom tooth?",
              "Is there parking?"
            ] },
            { id: "a", type: "textarea", rows: 2, label: "Your usual answer", placeholder: [
              "e.g. We do, but an appointment is safer. Walk-ins are seen when there is a gap, and on Saturdays that can mean a long wait.",
              "e.g. It starts at RM120 and takes about forty minutes. If there is a lot of staining it can run to RM180, and we tell you before we start.",
              "e.g. From about three years old. The first visit is a ride in the chair and a count of the teeth, nothing more.",
              "e.g. Yes, on treatments over RM1,000, through our instalment plan. Nothing extra is charged for spreading it out.",
              "e.g. Tell us when you book and we will give you a longer slot. Nothing happens until you say you are ready, and you can stop us at any point by raising a hand.",
              "e.g. About an hour in the chair. Most people come twice, a week apart, and the colour settles after a few days.",
              "e.g. No. Come in for a scan and we will tell you honestly whether an implant is the right answer for you.",
              "e.g. The first consultation is RM50, and it comes off the treatment if you go ahead with us.",
              "e.g. Yes, we are on several company panels. Bring your card and we will check it for you before anything starts.",
              "e.g. Once every six months for most people. If your gums bleed when you brush, come sooner.",
              "e.g. Almost never. It is done under local, you are awake, and it usually takes twenty minutes.",
              "e.g. Yes, free parking in the building and more on the street in front."
            ] }
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
        { id: "visit_email", type: "radio", label: "Email for enquiries",
          quote: "info@esteemdentalclinic.com",
          options: [{ label: "Correct" }, { label: "Change it", more: "Email" }] },
        { id: "visit_ig", type: "url", label: "Instagram", placeholder: "https://", half: true },
        { id: "visit_fb", type: "url", label: "Facebook", placeholder: "https://", half: true },
        { id: "visit_tt", type: "url", label: "TikTok", placeholder: "https://", half: true },
        { id: "visit_xhs", type: "url", label: "Xiaohongshu", placeholder: "https://", half: true },
      ]
    },

    {
      id: "look", title: "Look and feel",
      lede: "How the new site should feel when someone opens it.",
      fields: [
        { id: "look_words", type: "chips", label: "Pick up to three words for the feel", max: 3,
          options: ["Calm", "Warm", "Premium", "Friendly", "Modern", "Clean", "Gentle", "Family", "Bright", "Confident"] },
        { id: "look_refs", type: "repeat", min: 1, max: 6, item: "Website", add: "Add another website", compact: true,
          label: "Websites you like", hint: "Dental or not. Tell me what you like about each one.",
          fields: [
            { id: "url", type: "url", label: "Link", placeholder: "https://" },
            { id: "why", type: "text", label: "What you like about it", placeholder: "Clean, lots of white space, easy to find the treatments" }
          ] },
        { id: "look_avoid", type: "textarea", rows: 2, label: "Anything you do not want on the new site?",
          placeholder: "e.g. No stock photos of models with perfect teeth. Nothing that pops up over the page. No before and after photos on the homepage." }
      ]
    },

    {
      id: "files", title: "Photos and files",
      lede: "Real photos of your clinic and team make the biggest difference. Phone photos are fine if they are sharp and well lit.",
      fields: [
        { id: "files_upload", type: "files", label: "Upload photos or a zip file", hint: "Up to 95 MB a file. Anything bigger is easier as a link, below." },
        { id: "files_drive", type: "url", label: "Link to your materials", placeholder: "https://drive.google.com/",
          hint: "Google Drive, Dropbox, WeTransfer, whatever you already use. Send everything you have and I will pick what works. Nothing needs sorting first. Please set sharing to “Anyone with the link” so it opens." },
      ]
    },

    {
      id: "addons", title: "Add on",
      lede: "Anything you pick goes into the quotation.",
      fields: [
        { id: "add_lang", type: "radio", label: "More than one language",
          hint: "Every page written again in each language you add. RM250 a language.",
          options: [
            { label: "English only (included)" },
            { label: "English and Bahasa Melayu (RM250)" },
            { label: "English, Bahasa Melayu and Chinese (RM500)" }
          ] },
        { id: "add_care", type: "radio", label: "Website maintenance",
          hint: "Any update or change to the website is on me for the whole period.",
          options: [
            { label: "RM1,000 (12 months)" },
            { label: "RM600 (6 months)" },
            { label: "Not for now" }
          ] },
        { id: "add_seo", type: "radio", label: "SEO content",
          hint: "Four new articles a month, written and published for you.",
          options: [
            { label: "RM3,600 (12 months, 48 articles)" },
            { label: "RM2,000 (6 months, 24 articles)" },
            { label: "Not for now" }
          ] }
      ]
    }
  ],

  review: {
    title: "Ready to send",
    lede: "Check the sections below. Anything you skipped can be sorted out on a call.",
    fields: [
      { id: "end_when", type: "radio", label: "When would you like the new site to go live?", options: [{ label: "Within a month" }, { label: "In one to two months" }, { label: "In three months or more" }, { label: "No fixed date" }] },
      { id: "end_more", type: "textarea", rows: 4, label: "Your comments",
        hint: "Anything at all. A worry, a question, something you forgot earlier, something you disagree with.",
        placeholder: "e.g. We are adding a second branch next year. Dr X is away until February. We would like the site up before Raya. We are not sure about dropping the Oral Surgery page." },
      { id: "end_quote", type: "consent", label: "Confirm the plan. I am happy with the nine pages, and with anything I ticked under Add on. Please send the quotation.",
        hint: "Ticking this is not a contract. It tells me the plan is agreed so I can put a price to it." },
      { id: "end_ok", type: "consent", required: true, label: "We are happy for Shazwan Sites to use these answers and files to plan and build our website." }
    ]
  },

  done: {
    title: "Thank you. Everything is in.",
    lede: "I will read through it and come back to you with a page plan, the first homepage draft and a quotation."
  }
};
