(() => {
    "use strict";

    const hero = document.querySelector("[data-glitci-hero]");
    if (!hero) return;

    const heroScene = hero.querySelector("[data-hero-scene]");
    const robotImage = heroScene?.querySelector("[data-robot-image]");
    const robotMotion = heroScene?.querySelector("[data-robot-motion]");
    const robotScroll = heroScene?.querySelector("[data-robot-scroll]");
    const heroLogo = heroScene?.querySelector("[data-hero-logo]");
    const logoParallax = heroScene?.querySelector("[data-logo-parallax]");
    const heroContent = heroScene?.querySelector(".glitci-hero__content");
    const headerLogo = document.querySelector(".glitci-header-logo");

    if (!heroScene || !robotImage || !robotMotion || !robotScroll || !heroLogo || !logoParallax || !heroContent || !headerLogo) return;

    // Update progress values or sources here to retime the cinematic turntable.
    // Exactly one image is ever rendered in the robot stage.
    const peaceHoldStart = 0.95;
    const robotTimeline = [
        { progress: 0, state: "hey", src: "assets/images/Robot-Angles/Robot-Hey.png" },
        { progress: 0.12, state: "front", src: "assets/images/Robot-Angles/Robot-Front-View.png" },
        { progress: 0.22, state: "front-right", src: "assets/images/Robot-Angles/Robot-Front-Right.png" },
        { progress: 0.32, state: "right", src: "assets/images/Robot-Angles/Robot-Side-Right.png" },
        { progress: 0.42, state: "back-right", src: "assets/images/Robot-Angles/Robot-Back-Right.png" },
        { progress: 0.53, state: "back", src: "assets/images/Robot-Angles/Robot-Back.png" },
        { progress: 0.64, state: "back-left", src: "assets/images/Robot-Angles/Robot-Back-Side-Face-Back.png" },
        { progress: 0.75, state: "left", src: "assets/images/Robot-Angles/Robot-Side-Left.png" },
        { progress: 0.84, state: "front-left", src: "assets/images/Robot-Angles/Robot-Front-Left.png" },
        { progress: 0.9, state: "front", src: "assets/images/Robot-Angles/Robot-Front-View.png" },
        { progress: peaceHoldStart, state: "peace", src: "assets/images/Robot-Angles/Robot-Peace.png" },
    ];

    // Pin duration is measured in viewport heights to keep desktop and mobile pacing intentional.
    const heroTimelineSettings = {
        scrollViewportHeights: {
            desktop: 4.25,
            tablet: 3.5,
            mobile: 2.85,
            reduced: 0.7,
    },
        timelineProgressEnd: 1,
        peaceHoldStart,
        scrub: true,
        parallax: {
            robotX: 11,
            robotY: 8,
            robotTilt: 0.75,
            logoX: 4,
            logoY: 3,
        },
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let activeRobotState = "";
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let parallaxFrame = 0;

    function preloadRobotArt() {
        new Set(robotTimeline.map((frame) => frame.src)).forEach((src) => {
            const image = new Image();
            image.decoding = "async";
            image.src = src;
        });
    }

    function getRobotFrame(progress) {
        for (let index = robotTimeline.length - 1; index >= 0; index -= 1) {
            if (progress >= robotTimeline[index].progress) return robotTimeline[index];
        }

        return robotTimeline[0];
    }

    function setRobotFrame(progress) {
        const frame = getRobotFrame(progress);
        if (frame.state === activeRobotState) return;

        activeRobotState = frame.state;
        robotImage.src = frame.src;
        robotImage.dataset.robotState = frame.state;
    }

    function requestParallaxRender() {
        if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(renderParallax);
    }

    function renderParallax() {
        parallaxFrame = 0;
        currentPointerX += (targetPointerX - currentPointerX) * 0.08;
        currentPointerY += (targetPointerY - currentPointerY) * 0.08;

        const { robotX, robotY, robotTilt, logoX, logoY } = heroTimelineSettings.parallax;
        robotMotion.style.setProperty("--robot-x", `${currentPointerX * robotX}px`);
        robotMotion.style.setProperty("--robot-y", `${currentPointerY * robotY}px`);
        robotMotion.style.setProperty("--robot-tilt", `${currentPointerX * robotTilt}deg`);
        logoParallax.style.setProperty("--logo-parallax-x", `${currentPointerX * -logoX}px`);
        logoParallax.style.setProperty("--logo-parallax-y", `${currentPointerY * -logoY}px`);

        if (Math.abs(targetPointerX - currentPointerX) > 0.01 || Math.abs(targetPointerY - currentPointerY) > 0.01) {
            requestParallaxRender();
        }
    }

    function handlePointerMove(event) {
        if (!finePointer.matches || reducedMotion.matches) return;

        const rect = heroScene.getBoundingClientRect();
        targetPointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        targetPointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
        requestParallaxRender();
    }

    function resetParallax() {
        targetPointerX = 0;
        targetPointerY = 0;
        requestParallaxRender();
    }

    function getLogoTravel() {
        const source = heroLogo.getBoundingClientRect();
        const destination = headerLogo.getBoundingClientRect();

        return {
            x: destination.left + destination.width / 2 - (source.left + source.width / 2),
            y: destination.top + destination.height / 2 - (source.top + source.height / 2),
            scale: Math.min(destination.width / source.width, destination.height / source.height),
        };
    }

    function setupScrollTimeline() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(
        {
            desktop: "(min-width: 1024px)",
            tablet: "(min-width: 768px) and (max-width: 1023px)",
            mobile: "(max-width: 767px)",
            reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
            const { desktop, tablet, mobile, reduce } = context.conditions;
            const viewportMode = desktop ? "desktop" : tablet ? "tablet" : "mobile";
            let logoTravel;

            function measureLogoTravel() {
                gsap.set(heroLogo, {
                    xPercent: -50,
                    yPercent: -50,
                    x: 0,
                    y: 0,
                    scale: 1,
                    autoAlpha: 1,
                });

                logoTravel = getLogoTravel();
            }

            measureLogoTravel();

            gsap.set(headerLogo, { autoAlpha: 0 });
            setRobotFrame(0);

            const scrollDistance = () =>
                window.innerHeight *
                heroTimelineSettings.scrollViewportHeights[
                    reduce ? "reduced" : viewportMode
                ];

            const setScrollSpaceHeight = () => {
                const sceneHeight = heroScene.offsetHeight;

                hero.style.height = `${
                    reduce ? sceneHeight : scrollDistance() + sceneHeight
                }px`;
            };

            setScrollSpaceHeight();

            /*
             * Reduced-motion mode
             */
            if (reduce) {
                const reducedTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                        invalidateOnRefresh: true,

                        onRefreshInit: () => {
                            setScrollSpaceHeight();
                            measureLogoTravel();
                        },
                    },
                });

                reducedTimeline
                    .to(
                        heroLogo,
                        {
                            scale: 0.65,
                            autoAlpha: 0,
                            duration: 0.65,
                            ease: "none",
                        },
                        0
                    )
                    .to(
                        robotScroll,
                        {
                            y: -18,
                            scale: 0.96,
                            autoAlpha: 0,
                            duration: 0.42,
                            ease: "none",
                        },
                        0.48
                    )
                    .to(
                        headerLogo,
                        {
                            autoAlpha: 1,
                            duration: 0.08,
                            ease: "none",
                        },
                        0.57
                    )
                    .to(
                        heroContent,
                        {
                            y: 10,
                            autoAlpha: 0,
                            duration: 0.12,
                            ease: "none",
                        },
                        0.84
                    );

                return () => {
                    gsap.set(
                        [heroLogo, robotScroll, heroContent],
                        { clearProps: "all" }
                    );

                    gsap.set(headerLogo, { autoAlpha: 0 });
                };
            }

            /*
             * Normal cinematic timeline
             *
             * IMPORTANT:
             * The scene is NOT pinned by ScrollTrigger.
             * CSS sticky keeps the visual scene in the viewport
             * while the hero's scroll space drives this timeline.
             */
            gsap.set(heroScene, {
                position: "sticky",
                top: 0,
            });

            const frameProgress = { value: 0 };

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: () => `+=${scrollDistance()}`,
                    scrub: heroTimelineSettings.scrub,
                    invalidateOnRefresh: true,
                    refreshPriority: -1,

                    onRefreshInit: () => {
                        setScrollSpaceHeight();
                        measureLogoTravel();
                    },

                    onLeave: () => {
                        /*
                         * The scene is sticky rather than pinned,
                         * so there is no GSAP pin transform to clean up.
                         */
                    },

                    onEnterBack: () => {
                        /*
                         * Natural sticky re-entry.
                         */
                    },
                },
            });

            timeline
                /*
                 * Robot turntable
                 */
                .to(
                    frameProgress,
                    {
                        value: 1,
                        duration: heroTimelineSettings.timelineProgressEnd,
                        ease: "none",
                        onUpdate: () =>
                            setRobotFrame(frameProgress.value),
                    },
                    0
                )

                /*
                 * Logo travels into the real header logo position.
                 */
                .to(
                    heroLogo,
                    {
                        x: () => logoTravel.x,
                        y: () => logoTravel.y,
                        scale: () => logoTravel.scale,
                        duration: 0.75,
                        ease: "none",
                    },
                    0.14
                )

                /*
                 * Subtle robot movement during the cinematic sequence.
                 */
                .to(
                    robotScroll,
                    {
                        y: desktop ? -26 : mobile ? -14 : -20,
                        scale: desktop ? 1.055 : 1.025,
                        rotation: desktop ? -1 : -0.5,
                        duration: 0.7,
                        ease: "none",
                    },
                    0.14
                )

                /*
                 * Once the logo reaches the header,
                 * switch from hero logo to header logo.
                 */
                .to(
                    heroLogo,
                    {
                        autoAlpha: 0,
                        duration: 0.04,
                        ease: "none",
                    },
                    0.9
                )

                .to(
                    headerLogo,
                    {
                        autoAlpha: 1,
                        duration: 0.04,
                        ease: "none",
                    },
                    0.9
                )

                /*
                 * Hero copy fades near the end.
                 */
                .to(
                    heroContent,
                    {
                        y: 12,
                        autoAlpha: 0,
                        duration: 0.055,
                        ease: "none",
                    },
                    0.97
                );

            return () => {
                gsap.set(
                    [heroLogo, robotScroll, heroContent],
                    { clearProps: "all" }
                );

                gsap.set(heroScene, {
                    clearProps: "position,top",
                });

                gsap.set(headerLogo, { autoAlpha: 0 });

                setRobotFrame(0);
            };
        }
    );
}

    preloadRobotArt();
    setRobotFrame(0);
    heroScene.addEventListener("pointermove", handlePointerMove, { passive: true });
    heroScene.addEventListener("pointerleave", resetParallax);
    setupScrollTimeline();

    if (window.ScrollTrigger) {
        window.addEventListener(
            "load",
            () => {
                requestAnimationFrame(() => ScrollTrigger.refresh());
                window.setTimeout(() => ScrollTrigger.refresh(), 1000);
            },
            { once: true }
        );
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }
})();
