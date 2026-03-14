const data = [
  {
    key: "phone",
    title: "Phone",
    subtitle: "(732) 997-9107",
    kicker: "Direct",
    description: "Call me directly or copy my number.",
    icon: "fa-solid fa-phone",
    trackOpen: "phone_card_open",
    actions: [
      {
        type: "link",
        label: "Call me",
        href: "tel:7329979107",
        style: "primary",
        track: "phone_call_click"
      },
      {
        type: "copy",
        label: "Copy my number",
        value: "732-997-9107",
        style: "secondary",
        track: "phone_copy_click"
      }
    ]
  },
  {
    key: "email",
    title: "Email",
    subtitle: "jmizrahi7@gmail.com",
    kicker: "Message",
    description: "Send me an email or copy my address.",
    icon: "fa-solid fa-envelope",
    trackOpen: "email_card_open",
    actions: [
      {
        type: "link",
        label: "Send me an email",
        href: "mailto:jmizrahi7@gmail.com",
        style: "primary",
        track: "email_send_click"
      },
      {
        type: "copy",
        label: "Copy my email",
        value: "jmizrahi7@gmail.com",
        style: "secondary",
        track: "email_copy_click"
      }
    ]
  },
  {
    key: "resume",
    title: "Resume",
    subtitle: "Protected access",
    kicker: "Resume",
    description: "Enter the password to open my resume.",
    icon: "fa-solid fa-file-lines",
    trackOpen: "resume_card_open",
    requiresPassword: true,
    password: "MiZ",
    protectedLink: "assets/nesume.pdf",
    actions: [
      {
        type: "passwordPrompt",
        label: "Unlock resume",
        style: "primary",
        track: "resume_unlock_prompt"
      }
    ]
  },
  {
    key: "linkedin",
    title: "LinkedIn",
    subtitle: "josephamizrahi",
    kicker: "Profile",
    description: "Visit my LinkedIn or copy the profile link.",
    icon: "fa-brands fa-linkedin-in",
    trackOpen: "linkedin_card_open",
    actions: [
      {
        type: "link",
        label: "Visit my LinkedIn",
        href: "https://www.linkedin.com/in/josephamizrahi",
        style: "primary",
        track: "linkedin_visit_click"
      },
      {
        type: "copy",
        label: "Copy my LinkedIn",
        value: "https://www.linkedin.com/in/josephamizrahi",
        style: "secondary",
        track: "linkedin_copy_click"
      }
    ]
  },
  {
    key: "contact",
    title: "Save Contact",
    subtitle: "Joseph Mizrahi.vcf",
    kicker: "Contact file",
    description: "Save my contact card directly to your device.",
    icon: "fa-solid fa-address-card",
    trackOpen: "contact_card_open",
    actions: [
      {
        type: "link",
        label: "Download contact",
        href: "assets/Joseph Mizrahi.vcf",
        style: "primary",
        track: "contact_download_click",
        download: true
      }
    ]
  },
  {
    key: "venmo",
    title: "Venmo",
    subtitle: "@Joe-Miz",
    kicker: "Payments",
    description: "Open my Venmo or copy the username.",
    icon: "fa-brands fa-vimeo-v",
    trackOpen: "venmo_card_open",
    actions: [
      {
        type: "link",
        label: "Venmo direct",
        href: "https://venmo.com/Joe-Miz",
        style: "primary",
        track: "venmo_direct_click"
      },
      {
        type: "copy",
        label: "Copy Venmo",
        value: "@Joe-Miz",
        style: "secondary",
        track: "venmo_copy_click"
      }
    ]
  }
];
