<?= $this->extend('layouts/main') ?>

<?= $this->section('content') ?>

<section id="kv" class="relative isolate w-full aspect-[1920/1080] overflow-hidden text-cream">
    <div class=" absolute inset-0 -z-10">
        <img src="<?= esc(base_url('images/kv.jpg'), 'attr') ?>" alt=""
            class="reveal hero-pan w-full aspect-[1920/1080] object-cover" data-reveal>
    </div>
    <div class=" absolute inset-0 -z-9">
        <img src="<?= esc(base_url('images/kv-slogan.png'), 'attr') ?>" alt="2026 國際動物保護論壇"
            class="reveal w-full aspect-[1920/1080] object-cover" data-reveal>
    </div>

</section>

<section id="forum" class="section-forum py-20 md:py-28 bg-[#338bcb]">
    <div class="mx-auto px-10 md:px-16 flex items-top gap-10 max-lg:flex-col max-lg:items-center max-lg:gap-0">
        <div class="hidden max-lg:block title w-[calc(512/var(--design-w)*100vw)] ">
            <img src="<?= esc(base_url('images/title-forum.png'), 'attr') ?>" alt="論壇介紹"
                class="w-full aspect-[512/103] object-cover">
        </div>
        <div class="max-lg:hidden reveal w-[calc(591/var(--design-w)*100vw)] flex-shrink-0 " data-reveal>
            <img src="<?= esc(base_url('images/pic-1.png'), 'attr') ?>" alt=""
                class="w-full aspect-[591/2196] object-cover">
        </div>
        <div class="hidden max-lg:block reveal w-[calc(858/var(--design-w-mobile)*100vw)] flex-shrink-0 " data-reveal>
            <img src="<?= esc(base_url('images/pic-1-m.png'), 'attr') ?>" alt=""
                class="w-full aspect-[858/184] object-cover">
        </div>

        <div class="reveal" data-reveal>
            <div class="max-lg:hidden title w-[calc(512/var(--design-w)*100vw)] ">
                <img src="<?= esc(base_url('images/title-forum.png'), 'attr') ?>" alt="論壇介紹"
                    class="w-full aspect-[512/103] object-cover">
            </div>
            <?php if (!empty($forum['content_tw'])): ?>
                <p class="mt-[4rem] text-tw leading-relaxed text-[#fcfdfe]">
                    <?= nl2br(esc($forum['content_tw'])) ?>
                </p>
            <?php endif; ?>
            <?php if (!empty($forum['content_en'])): ?>
                <p class="mt-[4rem] text-en leading-relaxed text-[#fcfdfe]">
                    <?= nl2br(esc($forum['content_en'])) ?>
                </p>
            <?php endif; ?>

        </div>
    </div>
</section>

<section id="organizer" class="section-organizer py-20 md:py-28 bg-[#02471a]">
    <div class="mx-auto px-10 md:px-16 flex items-top gap-10 max-lg:flex-col max-lg:items-center max-lg:gap-0">
        <div class="hidden max-lg:block title w-[calc(772/var(--design-w)*100vw)]">
            <img src="<?= esc(base_url('images/title-organizer.png'), 'attr') ?>" alt="主辦單位介紹"
                class="w-full aspect-[772/105] object-cover">
        </div>
        <div class="reveal w-[calc(556/var(--design-w)*100vw)] flex-shrink-0 order-2 max-lg:hidden" data-reveal>
            <img src="<?= esc(base_url('images/pic-2.png'), 'attr') ?>" alt=""
                class="w-full aspect-[556/1434] object-cover">
        </div>
        <div class="hidden max-lg:block reveal w-[calc(945/var(--design-w-mobile)*100vw)] flex-shrink-0 " data-reveal>
            <img src="<?= esc(base_url('images/pic-2-m.png'), 'attr') ?>" alt=""
                class="w-full aspect-[945/237] object-cover">
        </div>
        <div class="reveal flex flex-col " data-reveal>
            <div class="max-lg:hidden title w-[calc(772/var(--design-w)*100vw)] self-end">
                <img src="<?= esc(base_url('images/title-organizer.png'), 'attr') ?>" alt="主辦單位介紹"
                    class="w-full aspect-[772/105] object-cover">
            </div>
            <?php if (!empty($organizer['content_tw'])): ?>
                <p class="mt-[4rem] text-tw leading-relaxed text-[#fcfdfe]">
                    <?= nl2br(esc($organizer['content_tw'])) ?>
                </p>
            <?php endif; ?>
            <?php if (!empty($organizer['content_en'])): ?>
                <p class="mt-[4rem] text-en leading-relaxed text-[#fcfdfe]">
                    <?= nl2br(esc($organizer['content_en'])) ?>
                </p>
            <?php endif; ?>

        </div>

    </div>
</section>

<?= $this->endSection() ?>