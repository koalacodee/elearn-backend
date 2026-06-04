CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."quiz_attempt_status" AS ENUM('in_progress', 'submitted', 'expired');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "units_order_index_unique" UNIQUE("order_index")
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"word" text NOT NULL,
	"arabic_translation" text NOT NULL,
	"sentence" text NOT NULL,
	"arabic_sentence" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"time_limit_sec" integer NOT NULL,
	"pass_threshold_pct" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question" text NOT NULL,
	"choices" jsonb NOT NULL,
	"correct_choice" integer NOT NULL,
	"grade" integer DEFAULT 1 NOT NULL,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quiz_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"deadline_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"score_earned" integer,
	"score_total" integer,
	"percentage" integer,
	"passed" boolean,
	"status" "quiz_attempt_status" DEFAULT 'in_progress' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt_answers" (
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"chosen_index" integer,
	CONSTRAINT "quiz_attempt_answers_attempt_id_question_id_pk" PRIMARY KEY("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "user_unit_progress" (
	"user_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone NOT NULL,
	"passed_at" timestamp with time zone,
	CONSTRAINT "user_unit_progress_user_id_unit_id_pk" PRIMARY KEY("user_id","unit_id")
);
--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unit_progress" ADD CONSTRAINT "user_unit_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unit_progress" ADD CONSTRAINT "user_unit_progress_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "words_unit_id_idx" ON "words" USING btree ("unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quizzes_mandatory_per_unit_idx" ON "quizzes" USING btree ("unit_id") WHERE "quizzes"."is_mandatory" = true;--> statement-breakpoint
CREATE INDEX "quiz_questions_quiz_id_idx" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_quiz_idx" ON "quiz_attempts" USING btree ("user_id","quiz_id");