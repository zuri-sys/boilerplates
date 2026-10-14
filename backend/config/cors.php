<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter(array_map('trim', explode(',', env(
        'FRONTEND_URL',
        'http://127.0.0.1:5173,http://localhost:5173,https://boilerplates-git-main-jyzd.vercel.app,https://boilerplates-bz6qh28ay-jyzd.vercel.app',
    )))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type'],
    'exposed_headers' => [],
    'max_age' => 600,
    'supports_credentials' => false,
];
