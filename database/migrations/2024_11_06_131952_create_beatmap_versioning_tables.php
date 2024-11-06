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
        DB::statement('CREATE TABLE IF NOT EXISTS osu_beatmapset_files (
            `beatmapset_id` MEDIUMINT UNSIGNED NOT NULL,
            `sha2_hash` BINARY(32) NOT NULL,

            PRIMARY KEY (`beatmapset_id`, `sha2_hash`),
            FOREIGN KEY (`beatmapset_id`) REFERENCES osu_beatmapsets(`beatmapset_id`) ON DELETE CASCADE)');

        Schema::create('osu_beatmapset_versions', function (Blueprint $table) {
            $table->mediumInteger('beatmapset_id')->unsigned();
            $table->mediumInteger('version_id')->unsigned();
            $table->dateTime('uploaded_on');

            $table->primary(['beatmapset_id', 'version_id']);
        });

        DB::statement('CREATE TABLE IF NOT EXISTS osu_beatmapset_version_files (
            `beatmapset_id` MEDIUMINT UNSIGNED NOT NULL,
            `sha2_hash` BINARY(32) NOT NULL,
            `version_id` MEDIUMINT UNSIGNED NOT NULL,
            `filename` VARCHAR(255) NOT NULL,

            PRIMARY KEY (`beatmapset_id`, `sha2_hash`, `version_id`),
            FOREIGN KEY (`beatmapset_id`) REFERENCES osu_beatmapsets(`beatmapset_id`) ON DELETE CASCADE,
            FOREIGN KEY (`beatmapset_id`, `sha2_hash`) REFERENCES osu_beatmapset_files(`beatmapset_id`, `sha2_hash`) ON DELETE CASCADE,
            FOREIGN KEY (`beatmapset_id`, `version_id`) REFERENCES osu_beatmapset_versions(`beatmapset_id`, `version_id`) ON DELETE CASCADE
        )');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('osu_beatmapset_version_files');
        Schema::dropIfExists('osu_beatmapset_versions');
        Schema::dropIfExists('osu_beatmapset_files');
    }
};
