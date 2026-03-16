const icons = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 8.5V19H3.56V8.5h3.38Zm.22-3.25c0 1.01-.76 1.82-1.91 1.82h-.02c-1.08 0-1.84-.81-1.84-1.82 0-1.03.78-1.82 1.88-1.82s1.86.79 1.89 1.82ZM20.5 12.59V19h-3.37v-6.02c0-1.51-.54-2.54-1.89-2.54-1.03 0-1.64.7-1.91 1.37-.1.24-.12.58-.12.91V19H9.84s.04-9.72 0-10.5h3.37v1.49c.45-.7 1.26-1.69 3.06-1.69 2.24 0 3.92 1.46 3.92 4.59Z"/></svg>',
  resume:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 1.5V9h4.5L13 4.5ZM9 12h6v1.5H9V12Zm0 3h6v1.5H9V15Zm0-6h2.5V10.5H9V9Z"/></svg>',
  contact:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.51l7 4.38 7-4.38V6H5Zm14 12V8.87l-6.47 4.05a1 1 0 0 1-1.06 0L5 8.87V18h14Z"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.56 3.57.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.19 2.45.56 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2Z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.24l8 5.33 8-5.33V7H4Zm16 10V9.64l-7.45 4.97a1 1 0 0 1-1.1 0L4 9.64V17h16Z"/></svg>',
  venmo:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 5.5c.1.72.15 1.44.15 2.16 0 7.4-6.13 13.34-7.9 13.34h-.02c-1.37 0-2.28-.88-2.8-2.5L5.2 6.47h4.16l1.64 8.17c.31 1.51.52 2.09.73 2.09.4 0 2.78-3.88 2.78-8.38 0-.97-.17-1.9-.48-2.85h4.87Z"/></svg>'
};

const data = [
  {
    key: "linkedin",
    title: "LinkedIn",
    subtitle: "linkedin.com/in/josephamizrahi",
    kicker: "Profile",
    description: "Visit linkedin.com/in/josephamizrahi or copy the profile link.",
    icon: icons.linkedin,
    actions: [
      {
        type: "link",
        label: "Visit LinkedIn",
        href: "https://www.linkedin.com/in/josephamizrahi",
        style: "primary"
      },
      {
        type: "copy",
        label: "Copy LinkedIn URL",
        value: "linkedin.com/in/josephamizrahi",
        style: "secondary"
      }
    ]
  },
  {
    key: "resume",
    title: "Resume",
    subtitle: "View my current resume",
    kicker: "Document",
    description: "Enter the password to open my resume.",
    icon: icons.resume,
    requiresPassword: true,
    password: "MiZ",
    protectedLink: "assets/files/resume.pdf",
    actions: [
      {
        type: "passwordPrompt",
        label: "Unlock resume",
        style: "primary"
      }
    ]
  },
  {
    key: "contact",
    title: "Contact",
    subtitle: "Preview my contact details",
    kicker: "Contact card",
    description: "View my contact details here and copy anything you need.",
    icon: icons.contact,
    preview: [
      {
        label: "Name",
        value: "Joseph Mizrahi"
      },
      {
        label: "Phone",
        value: "(732) 997-9107"
      },
      {
        label: "Email",
        value: "jmizrahi7@gmail.com"
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/josephamizrahi"
      }
    ],
    actions: [
      {
        type: "copy",
        label: "Copy full name",
        value: "Joseph Mizrahi",
        style: "primary"
      },
      {
        type: "copy",
        label: "Copy phone number",
        value: "732-997-9107",
        style: "secondary"
      },
      {
        type: "copy",
        label: "Copy email address",
        value: "jmizrahi7@gmail.com",
        style: "secondary"
      },
      {
        type: "copy",
        label: "Copy LinkedIn URL",
        value: "linkedin.com/in/josephamizrahi",
        style: "primary"
      }
    ]
  },
  {
    key: "phone",
    title: "Phone",
    subtitle: "(732) 997-9107",
    kicker: "Direct",
    description: "Call me directly or copy my number.",
    icon: icons.phone,
    actions: [
      {
        type: "link",
        label: "Call me",
        href: "tel:7329979107",
        style: "primary"
      },
      {
        type: "copy",
        label: "Copy phone number",
        value: "732-997-9107",
        style: "secondary"
      }
    ]
  },
  {
    key: "email",
    title: "Email",
    subtitle: "jmizrahi7@gmail.com",
    kicker: "Message",
    description: "Send me an email or copy my address.",
    icon: icons.email,
    actions: [
      {
        type: "link",
        label: "Send email",
        href: "mailto:jmizrahi7@gmail.com",
        style: "primary"
      },
      {
        type: "copy",
        label: "Copy email address",
        value: "jmizrahi7@gmail.com",
        style: "secondary"
      }
    ]
  },
  {
    key: "venmo",
    title: "Venmo",
    subtitle: "@Joe-Miz",
    kicker: "Payments",
    description: "Open my Venmo profile or copy the username.",
    icon: icons.venmo,
    actions: [
      {
        type: "link",
        label: "Open Venmo",
        href: "https://venmo.com/Joe-Miz",
        style: "primary"
      },
      {
        type: "copy",
        label: "Copy Venmo handle",
        value: "@Joe-Miz",
        style: "secondary"
      }
    ]
  }
];
