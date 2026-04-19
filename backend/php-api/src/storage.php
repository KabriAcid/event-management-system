<?php

declare(strict_types=1);

final class JsonStore
{
    private string $dataDir;

    public function __construct(string $dataDir)
    {
        $this->dataDir = $dataDir;
    }

    public function read(string $fileName, array $fallback = []): array
    {
        $path = $this->path($fileName);

        if (!file_exists($path)) {
            return $fallback;
        }

        $content = file_get_contents($path);
        if ($content === false || trim($content) === '') {
            return $fallback;
        }

        $decoded = json_decode($content, true);
        return is_array($decoded) ? $decoded : $fallback;
    }

    public function write(string $fileName, array $data): void
    {
        $path = $this->path($fileName);
        file_put_contents(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }

    public function nextNumericId(array $items): int
    {
        $maxId = 0;

        foreach ($items as $item) {
            if (isset($item['id']) && is_numeric($item['id'])) {
                $maxId = max($maxId, (int) $item['id']);
            }
        }

        return $maxId + 1;
    }

    private function path(string $fileName): string
    {
        return rtrim($this->dataDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $fileName;
    }
}
