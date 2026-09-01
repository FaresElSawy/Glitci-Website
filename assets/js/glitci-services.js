(function () {
  "use strict";

  const SERVICE_DATA = [
    {
      number: "01",
      title: "Web Development",
      kicker: "Strategy + identity",
      description:
        "Make the right first impression with a clear identity built around what your business is here to do.",
      tags: [
        "UX Research & Strategy",
        "UX & UI Design",
        "Website Design & Development",
        "Scroll-Driven Animations",
        "Motion & Interaction Design",
        "Accessibility Optimization",
        "API Integrations",
      ],
      icon: `<img src="assets/images/item/process-red-1.png" alt="" aria-hidden="true">`,
    },
    {
      number: "02",
      title: "Digital Marketing & Growth",
      kicker: "Content + growth",
      description:
        "Reach the right audience with focused campaigns, search visibility, and marketing decisions guided by useful insight.",
      tags: ["Digital strategy", "SEO", "Marketing analytics"],
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 45V28M25 45V19M38 45V34M51 45V13"></path><path class="accent" d="m13 23 12-8 13 7 13-12"></path><circle class="accent" cx="51" cy="13" r="3"></circle></svg>`,
    },
    {
      number: "03",
      title: "Social Media & Content Marketing",
      kicker: "Content + community",
      description:
        "Create consistent content and campaigns that build stronger communities and keep your brand present across the platforms that matter.",
      tags: ["Content creation", "Campaigns", "Social media"],
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="25" r="8"></circle><circle cx="43" cy="25" r="8"></circle><path class="accent" d="M10 47c2-8 8-12 16-12s14 4 16 12M31 47c2-6 7-10 14-10 5 0 8 2 10 5"></path></svg>`,
    },
    {
      number: "04",
      title: "UI/UX & Product Design",
      kicker: "Experience + product",
      description:
        "Shape clear digital products through research, interface design, and systems that make every interaction easier to understand.",
      tags: ["User research", "Interface design", "Design systems"],
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="14" width="40" height="35" rx="3"></rect><path d="M12 23h40M20 18h.01M26 18h.01M32 18h.01"></path><path class="accent" d="M23 34h18M23 40h11"></path></svg>`,
    },
    {
      number: "05",
      title: "Website Design & Development",
      kicker: "Build + launch",
      description:
        "Build fast, scalable websites that express the brand clearly and give people a reliable path through every digital interaction.",
      tags: ["Web development", "Responsive design", "Performance"],
      icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="11" y="14" width="42" height="30" rx="3"></rect><path d="M11 22h42M26 51h12M32 44v7"></path><path class="accent" d="m25 30-6 5 6 5M39 30l6 5-6 5M35 28l-6 14"></path></svg>`,
    },
  ];

  function initServices() {
    const section = document.querySelector(".glitci-services");
    if (!section || !window.gsap || !window.ScrollTrigger) return;

    const orbitTrack = section.querySelector("[data-services-nav]");
    const mobileNav = section.querySelector("[data-services-mobile-nav]");
    const copyStack = section.querySelector("[data-services-copy]");
    const visualStack = section.querySelector("[data-services-visuals]");
    const progress = section.querySelector("[data-services-progress]");
    const activeLabel = section.querySelector("[data-services-active-label]");
    const activeProgress = section.querySelector(
      "[data-services-active-progress]",
    );

    orbitTrack.innerHTML = SERVICE_DATA.map(
      (service, index) => `
      <button class="glitci-services__nav-item" type="button" data-service-index="${index}" style="--service-angle:${90 + index * 30}deg;--service-mobile-angle:${180 + index * 30}deg" aria-label="View ${service.title}" aria-current="${index === 0}">
        <span class="glitci-services__nav-number">${service.number}</span>
        <span class="glitci-services__nav-title">${service.title}</span>
        <span class="glitci-services__nav-dot" aria-hidden="true"></span>
      </button>
    `,
    ).join("");

    mobileNav.innerHTML = SERVICE_DATA.map(
      (service, index) => `
      <button class="glitci-services__mobile-item" type="button" data-service-index="${index}" aria-label="View ${service.title}" aria-current="${index === 0}">${service.number}</button>
    `,
    ).join("");

    copyStack.innerHTML = SERVICE_DATA.map(
      (service, index) => `
      <article class="glitci-services__copy${index === 0 ? " is-active" : ""}" data-service-copy-index="${index}" aria-hidden="${index !== 0}">
        <span class="glitci-services__copy-kicker">${service.number} / ${service.kicker}</span>
        <h3>${service.title}</h3>
        <p class="glitci-services__copy-description">${service.description}</p>
        <div class="glitci-services__tags">${service.tags.map((tag) => `<span class="glitci-services__tag">${tag}</span>`).join("")}</div>
      </article>
    `,
    ).join("");

    visualStack.innerHTML = SERVICE_DATA.map(
      (service, index) => `
      <figure class="glitci-services__visual${index === 0 ? " is-active" : ""}" data-service-visual-index="${index}" aria-hidden="${index !== 0}">
        <span class="glitci-services__visual-icon" role="img" aria-label="${service.title} icon">${service.icon}</span>
        <figcaption class="glitci-services__visual-meta"><strong>${service.number}</strong><span>${service.title}</span></figcaption>
      </figure>
    `,
    ).join("");

    const navItems = Array.from(
      section.querySelectorAll("[data-service-index]"),
    );
    const copies = Array.from(
      section.querySelectorAll("[data-service-copy-index]"),
    );
    const visuals = Array.from(
      section.querySelectorAll("[data-service-visual-index]"),
    );
    const totalTransitions = SERVICE_DATA.length - 1;
    let currentIndex = 0;
    let servicesTrigger = null;

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.set(copies, { autoAlpha: 0, y: 24 });
    window.gsap.set(copies[0], { autoAlpha: 1, y: 0 });
    window.gsap.set(visuals, { autoAlpha: 0, scale: 0.95, y: 18 });
    window.gsap.set(visuals[0], { autoAlpha: 1, scale: 1, y: 0 });
    window.gsap.set(orbitTrack, { rotation: 0 });

    const updateOrbitGeometry = () => {
      orbitTrack.style.setProperty(
        "--orbit-radius",
        `${orbitTrack.offsetWidth * 0.5}px`,
      );
    };

    const setCurrentIndex = (index) => {
      if (
        index === currentIndex &&
        navItems.some((item) => item.getAttribute("aria-current") !== "true")
      )
        return;
      currentIndex = index;
      navItems.forEach((item) => {
        const isCurrent = Number(item.dataset.serviceIndex) === index;
        item.setAttribute("aria-current", String(isCurrent));
      });
      copies.forEach((copy, copyIndex) => {
        copy.classList.toggle("is-active", copyIndex === index);
        copy.setAttribute("aria-hidden", String(copyIndex !== index));
      });
      visuals.forEach((visual, visualIndex) => {
        visual.classList.toggle("is-active", visualIndex === index);
        visual.setAttribute("aria-hidden", String(visualIndex !== index));
      });
      if (activeLabel)
        activeLabel.textContent = `${SERVICE_DATA[index].number} / ${SERVICE_DATA[index].title}`;
      if (activeProgress)
        activeProgress.textContent = `${SERVICE_DATA[index].number} — 05`;
    };

    const getScrollLength = () => {
      const mobile = window.innerWidth < 768;
      const step = mobile
        ? Math.max(520, window.innerHeight * 0.88)
        : Math.max(640, window.innerHeight * 0.95);
      return step * totalTransitions;
    };

    const timeline = window.gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        id: "glitci-services-scroll",
        trigger: section,
        start: "top top",
        end: () => `+=${getScrollLength()}`,
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          servicesTrigger = self;
          const position = self.progress * totalTransitions;
          const nextIndex = Math.min(
            SERVICE_DATA.length - 1,
            Math.round(position),
          );
          setCurrentIndex(nextIndex);
          if (progress) progress.style.width = `${self.progress * 100}%`;
        },
      },
    });

    timeline.to(
      orbitTrack,
      {
        rotation: -30 * totalTransitions,
        duration: totalTransitions,
        ease: "none",
      },
      0,
    );

    for (let index = 0; index < totalTransitions; index += 1) {
      const transitionAt = index + 0.42;
      timeline.to(
        copies[index],
        { autoAlpha: 0, y: -24, duration: 0.56 },
        transitionAt,
      );
      timeline.to(
        visuals[index],
        { autoAlpha: 0, scale: 1.055, y: -12, duration: 0.7 },
        transitionAt,
      );
      timeline.fromTo(
        copies[index + 1],
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.68 },
        transitionAt + 0.12,
      );
      timeline.fromTo(
        visuals[index + 1],
        { autoAlpha: 0, scale: 0.95, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.82 },
        transitionAt + 0.08,
      );
    }

    const goToService = (index) => {
      const trigger = servicesTrigger || timeline.scrollTrigger;
      if (!trigger) return;
      const target =
        trigger.start +
        (index / totalTransitions) * (trigger.end - trigger.start);
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    navItems.forEach((item) => {
      item.addEventListener("click", () =>
        goToService(Number(item.dataset.serviceIndex)),
      );
    });

    updateOrbitGeometry();
    window.addEventListener("resize", updateOrbitGeometry, { passive: true });
    window.ScrollTrigger.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initServices, { once: true });
  } else {
    initServices();
  }
})();
