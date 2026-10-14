<?php

namespace Tests\Feature;

use Tests\TestCase;

class DeploymentTest extends TestCase
{
    public function test_api_root_identifies_the_service(): void
    {
        $this->getJson('/')->assertOk()->assertJsonPath('service', 'Supportdesk API');
    }

    public function test_configured_frontend_can_preflight_authenticated_api_requests(): void
    {
        $this->withHeaders([
            'Origin' => 'http://127.0.0.1:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization,content-type',
        ])->options('/api/tickets')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
    }

    public function test_unconfigured_origin_is_not_allowed(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'https://unconfigured.example',
            'Access-Control-Request-Method' => 'POST',
        ])->options('/api/tickets');

        $this->assertFalse($response->headers->has('Access-Control-Allow-Origin'));
    }
}
