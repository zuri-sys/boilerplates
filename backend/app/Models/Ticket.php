<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = ['requester_name', 'requester_email', 'issue_category', 'priority', 'subject', 'description', 'status'];

    protected $appends = ['ticket_number'];

    protected function ticketNumber(): Attribute
    {
        return Attribute::make(get: fn (): string => 'IT-'.str_pad((string) $this->id, 5, '0', STR_PAD_LEFT));
    }
}
