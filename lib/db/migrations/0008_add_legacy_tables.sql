-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS upscaletask_id_seq;
CREATE SEQUENCE IF NOT EXISTS downloadedvideo_id_seq;
CREATE SEQUENCE IF NOT EXISTS task_id_seq;
CREATE SEQUENCE IF NOT EXISTS clip_id_seq;
CREATE SEQUENCE IF NOT EXISTS clipfragment_id_seq;

-- Schema for table: upscaletask
CREATE TABLE IF NOT EXISTS "upscaletask" (
  "id" integer NOT NULL DEFAULT nextval('upscaletask_id_seq'),
  "progress" integer,
  "created_at" timestamp without time zone NOT NULL,
  "updated_at" timestamp without time zone NOT NULL,
  "error" character varying,
  "vast_instance_id" character varying,
  "vast_job_id" character varying,
  "result_path" character varying,
  "file_path" character varying NOT NULL,
  "status" character varying NOT NULL,
  "stage" character varying
);

-- Schema for table: downloadedvideo
CREATE TABLE IF NOT EXISTS "downloadedvideo" (
  "id" integer NOT NULL DEFAULT nextval('downloadedvideo_id_seq'),
  "created_at" timestamp without time zone NOT NULL,
  "url" character varying NOT NULL,
  "title" character varying
);

-- Schema for table: task
CREATE TABLE IF NOT EXISTS "task" (
  "id" integer NOT NULL DEFAULT nextval('task_id_seq'),
  "progress" integer,
  "start_time" double precision,
  "end_time" double precision,
  "created_at" timestamp without time zone NOT NULL,
  "updated_at" timestamp without time zone NOT NULL,
  "video_id" character varying,
  "original_filename" character varying,
  "downloaded_path" character varying,
  "processed_path" character varying,
  "clips_dir" character varying,
  "transcript_path" character varying,
  "clips_json_path" character varying,
  "url" character varying NOT NULL,
  "mode" character varying NOT NULL,
  "status" character varying NOT NULL,
  "stage" character varying,
  "error" character varying
);

-- Schema for table: clip
CREATE TABLE IF NOT EXISTS "clip" (
  "short_id" integer NOT NULL,
  "created_at" timestamp without time zone NOT NULL,
  "task_id" integer NOT NULL,
  "id" integer NOT NULL DEFAULT nextval('clip_id_seq'),
  "hook_strength" character varying,
  "why_it_works" character varying,
  "file_path" character varying,
  "status" character varying,
  "channel" character varying,
  "title" character varying NOT NULL,
  "description" character varying NOT NULL,
  "duration_estimate" character varying
);

-- Schema for table: clipfragment
CREATE TABLE IF NOT EXISTS "clipfragment" (
  "clip_id" integer NOT NULL,
  "id" integer NOT NULL DEFAULT nextval('clipfragment_id_seq'),
  "order" integer NOT NULL,
  "visual_suggestion" character varying,
  "end_time" character varying NOT NULL,
  "start_time" character varying NOT NULL,
  "text" character varying NOT NULL
);
