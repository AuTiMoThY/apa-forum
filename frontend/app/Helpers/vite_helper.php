<?php

declare(strict_types=1);

if (! function_exists('vite_tags')) {
    /**
     * 開發模式讀取 public/hot；正式模式讀取 Vite manifest。
     */
    function vite_tags(string $entry = 'resources/js/main.js'): string
    {
        // 僅 development 才讀 public/hot；production 誤傳 hot 檔也不會指向 localhost:5173
        $hotFile = FCPATH . 'hot';

        if (ENVIRONMENT === 'development' && is_file($hotFile)) {
            $devUrl = rtrim((string) file_get_contents($hotFile), "\r\n");

            return implode("\n", [
                '<script type="module" src="' . esc($devUrl . '/@vite/client', 'attr') . '"></script>',
                '<script type="module" src="' . esc($devUrl . '/' . ltrim($entry, '/'), 'attr') . '"></script>',
            ]);
        }

        $manifestPath = FCPATH . 'assets/.vite/manifest.json';
        if (! is_file($manifestPath)) {
            $manifestPath = FCPATH . 'assets/manifest.json';
        }

        if (! is_file($manifestPath)) {
            return '<!-- Vite manifest not found. Run: pnpm build -->';
        }

        /** @var array<string, array{file?: string, css?: list<string>}> $manifest */
        $manifest = json_decode((string) file_get_contents($manifestPath), true) ?? [];
        $item     = $manifest[$entry] ?? null;

        if ($item === null) {
            return '<!-- Vite entry not found in manifest: ' . esc($entry) . ' -->';
        }

        $tags = [];

        foreach ($item['css'] ?? [] as $cssFile) {
            $tags[] = '<link rel="stylesheet" href="' . esc(base_url('assets/' . $cssFile), 'attr') . '">';
        }

        if (! empty($item['file'])) {
            $tags[] = '<script type="module" src="' . esc(base_url('assets/' . $item['file']), 'attr') . '"></script>';
        }

        return implode("\n", $tags);
    }
}
