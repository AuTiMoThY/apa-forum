<header
    data-site-header
    class="main_header fixed inset-x-0 top-0 z-50 transition duration-300 bg-white [&.is-scrolled]:backdrop-blur-md [&.is-scrolled]:shadow-lg [&.is-scrolled]:shadow-ink/10"
>
    <div class="mx-auto flex items-center justify-between gap-10 px-5 md:px-8">
        <a href="<?= esc(base_url('/'), 'attr') ?>" class="group flex min-w-0">
            <img src="<?= esc(base_url('images/apa-logo.jpg'), 'attr') ?>" alt="Logo" class="w-[404px] aspect-[404/70]">
        </a>

        <nav aria-label="主要導覽" class="hidden items-center gap-8 lg:flex">
            <a href="#forum" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-1.png'), 'attr') ?>" alt="論壇介紹" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Forum</span>
            </a>
            <a href="#organizer" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-2.png'), 'attr') ?>" alt="主辦單位介紹" class="txt-img aspect-[184/25]">
                </span>
                <span class="txt-en">Organizer</span>
            </a>
            <a href="#agenda" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-3.png'), 'attr') ?>" alt="議程說明" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Agenda</span>
            </a>
            <a href="#speaker" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-4.png'), 'attr') ?>" alt="講師介紹" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Speaker</span>
            </a>
            <a href="#partners" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-5.png'), 'attr') ?>" alt="合作夥伴" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Partners</span>
            </a>
            <a href="#registration" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-6.png'), 'attr') ?>" alt="立即報名" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Registration</span>
            </a>
        </nav>

        <button
            type="button"
            data-menu-toggle
            class="hamburger relative z-[60] flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label="開啟選單"
            aria-expanded="false"
            aria-controls="mobile-menu"
        >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
    </div>

    <div
        data-menu-overlay
        class="menu-overlay fixed inset-0 z-40 bg-ink/40 opacity-0 pointer-events-none transition-opacity duration-300 lg:hidden"
        aria-hidden="true"
    ></div>

    <nav
        id="mobile-menu"
        data-mobile-menu
        aria-label="手機導覽"
        aria-hidden="true"
        class="mobile-menu fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] translate-x-full flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden"
    >
        <div class="flex flex-col gap-1 overflow-y-auto px-4 pb-8 pt-20">
            <a href="#forum" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-1.png'), 'attr') ?>" alt="論壇介紹" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Forum</span>
            </a>
            <a href="#organizer" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-2.png'), 'attr') ?>" alt="主辦單位介紹" class="txt-img aspect-[184/25]">
                </span>
                <span class="txt-en">Organizer</span>
            </a>
            <a href="#agenda" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-3.png'), 'attr') ?>" alt="議程說明" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Agenda</span>
            </a>
            <a href="#speaker" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-4.png'), 'attr') ?>" alt="講師介紹" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Speaker</span>
            </a>
            <a href="#partners" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-5.png'), 'attr') ?>" alt="合作夥伴" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Partners</span>
            </a>
            <a href="#registration" class="nav-item">
                <span class="txt-tw">
                    <img src="<?= esc(base_url('images/nav-6.png'), 'attr') ?>" alt="立即報名" class="txt-img aspect-[123/25]">
                </span>
                <span class="txt-en">Registration</span>
            </a>
        </div>
    </nav>
</header>
