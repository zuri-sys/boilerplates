<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->string('requester_name', 120);
            $table->string('requester_email', 254);
            $table->string('issue_category', 50);
            $table->string('priority', 20)->index();
            $table->string('subject', 200);
            $table->text('description');
            $table->string('status', 20)->default('Open')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
