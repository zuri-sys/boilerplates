<?php

namespace Tests\Feature;

use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, string> */
    private function ticketData(): array
    {
        return [
            'requester_name' => 'Alex Santos',
            'requester_email' => 'alex@example.com',
            'issue_category' => 'Network',
            'priority' => 'High',
            'subject' => 'Cannot connect to office Wi-Fi',
            'description' => 'The laptop disconnects when joining the office network.',
            'status' => 'Open',
        ];
    }

    private function signIn(): void
    {
        $response = $this->postJson('/api/auth/login', ['username' => 'itadmin', 'password' => 'helpdesk123']);
        $response->assertOk()->assertJsonStructure(['token', 'expires_at']);
        $this->withToken($response->json('token'));
    }

    public function test_tickets_require_a_valid_session_and_login_rejects_bad_credentials(): void
    {
        $this->getJson('/api/tickets')->assertUnauthorized();
        $this->postJson('/api/tickets', $this->ticketData())->assertUnauthorized();
        $this->postJson('/api/auth/login', ['username' => 'itadmin', 'password' => 'wrong'])->assertUnauthorized();
        $this->withToken('tampered-token')->getJson('/api/tickets')->assertUnauthorized();
        $expired = Crypt::encryptString(json_encode(['username' => 'itadmin', 'expires_at' => now()->subMinute()->getTimestamp()], JSON_THROW_ON_ERROR));
        $this->withToken($expired)->getJson('/api/tickets')->assertUnauthorized();
    }

    public function test_ticket_crud_persists_and_returns_complete_details(): void
    {
        $this->signIn();
        $response = $this->postJson('/api/tickets', [...$this->ticketData(), 'status' => 'Closed']);
        $response->assertCreated()->assertJsonPath('status', 'Open')->assertJsonStructure(['id', 'ticket_number', 'created_at', 'updated_at']);
        $id = $response->json('id');
        $this->assertDatabaseHas('tickets', ['id' => $id, 'subject' => $this->ticketData()['subject']]);
        $this->getJson('/api/tickets')->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $id);
        $this->getJson('/api/tickets/'.$id)->assertOk()->assertJsonPath('description', $this->ticketData()['description']);
        $this->putJson('/api/tickets/'.$id, [...$this->ticketData(), 'status' => 'Resolved', 'priority' => 'Low'])->assertOk()->assertJsonPath('status', 'Resolved');
        $this->assertSame('Resolved', Ticket::findOrFail($id)->status);
        $this->deleteJson('/api/tickets/'.$id)->assertNoContent();
        $this->assertDatabaseMissing('tickets', ['id' => $id]);
        $this->getJson('/api/tickets/'.$id)->assertNotFound();
    }

    public function test_required_fields_email_and_supported_options_are_validated(): void
    {
        $this->signIn();
        $this->postJson('/api/tickets', [])->assertUnprocessable()->assertJsonValidationErrors(['requester_name', 'requester_email', 'issue_category', 'priority', 'subject', 'description']);
        $this->postJson('/api/tickets', [...$this->ticketData(), 'requester_email' => 'invalid', 'priority' => 'Urgent', 'issue_category' => 'Unsupported', 'status' => 'Unknown'])->assertUnprocessable()->assertJsonValidationErrors(['requester_email', 'priority', 'issue_category', 'status']);
        $this->postJson('/api/tickets', [...$this->ticketData(), 'subject' => str_repeat('x', 201)])->assertUnprocessable()->assertJsonValidationErrors('subject');
        $this->assertDatabaseCount('tickets', 0);
    }
}
