<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId("customer_id")->constrained("customers");
            $table->date("transaction_date");
            $table->date("pickup_date");
            $table->foreignId("service_id")->constrained("services");
            $table->foreignId("transaction_status_id")->constrained("transaction_statuses");
            $table->foreignId("payment_status_id")->constrained("payment_statuses");
            $table->foreignId('payment_method_id')->constrained("payment_methods");
            $table->text('description');

            // Foto Before
            $table->string('before_image_url')->nullable();
            $table->string('before_image_public_id')->nullable();

            // Foto After
            $table->string('after_image_url')->nullable();
            $table->string('after_image_public_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
