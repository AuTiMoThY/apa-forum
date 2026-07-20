<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= esc($title ?? '2026 國際動物保護論壇') ?></title>
    <meta name="description" content="<?= esc($description ?? '2026 國際動物保護論壇官方網站') ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&display=swap" rel="stylesheet">
    <?= vite_tags() ?>
</head>
<body class="min-h-screen flex flex-col pt-[var(--header-height)]">
    <?= view('partials/header') ?>

    <main id="main" class="flex-1">
        <?= $this->renderSection('content') ?>
    </main>

    <?= view('partials/footer') ?>
</body>
</html>
