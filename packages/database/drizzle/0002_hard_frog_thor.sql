CREATE TABLE "transaction_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"height" integer NOT NULL,
	"tx_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_event_attribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_event_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "nft_bid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" varchar(255) NOT NULL,
	"nft" uuid NOT NULL,
	"bid_price" numeric,
	"bid_denom" varchar(255),
	"bid_block_height" integer,
	"removed_block_height" integer
);
--> statement-breakpoint
CREATE TABLE "nft_collection_bid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" varchar(255) NOT NULL,
	"collection" varchar(255) NOT NULL,
	"units" integer,
	"funds_amount" numeric,
	"funds_denom" varchar(255),
	"bid_price" numeric,
	"bid_denom" varchar(255),
	"bid_block_height" integer,
	"removed_block_height" integer
);
--> statement-breakpoint
CREATE TABLE "nft_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" varchar(255) NOT NULL,
	"nft" uuid NOT NULL,
	"for_sale_price" numeric,
	"for_sale_denom" varchar(255),
	"for_sale_block_height" integer,
	"unlisted_block_height" integer
);
--> statement-breakpoint
CREATE TABLE "nft_transfer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_owner" varchar(255) NOT NULL,
	"to_owner" varchar(255) NOT NULL,
	"transferred_on_block_height" integer NOT NULL,
	"nft_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nft_to_trait" (
	"nft_id" uuid NOT NULL,
	"trait_id" uuid NOT NULL,
	CONSTRAINT "nft_to_trait_nft_id_trait_id_pk" PRIMARY KEY("nft_id","trait_id")
);
--> statement-breakpoint
CREATE TABLE "nft_trait" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" varchar(255),
	"display_type" varchar(255),
	"trait_type" varchar(255),
	"trait_value" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "addressReference" RENAME TO "address_reference";--> statement-breakpoint
ALTER TABLE "blockEvent" RENAME TO "block_event";--> statement-breakpoint
ALTER TABLE "blockEventAttribute" RENAME TO "block_event_attribute";--> statement-breakpoint
ALTER TABLE "monitoredValue" RENAME TO "monitored_value";--> statement-breakpoint
ALTER TABLE "address_reference" RENAME COLUMN "transactionId" TO "transaction_id";--> statement-breakpoint
ALTER TABLE "address_reference" RENAME COLUMN "messageId" TO "message_id";--> statement-breakpoint
ALTER TABLE "block" RENAME COLUMN "dayId" TO "day_id";--> statement-breakpoint
ALTER TABLE "block" RENAME COLUMN "txCount" TO "tx_count";--> statement-breakpoint
ALTER TABLE "block" RENAME COLUMN "isProcessed" TO "is_processed";--> statement-breakpoint
ALTER TABLE "block" RENAME COLUMN "totalTxCount" TO "total_tx_count";--> statement-breakpoint
ALTER TABLE "block_event_attribute" RENAME COLUMN "blockEventId" TO "block_event_id";--> statement-breakpoint
ALTER TABLE "day" RENAME COLUMN "aktPrice" TO "token_price";--> statement-breakpoint
ALTER TABLE "day" RENAME COLUMN "firstBlockHeight" TO "first_block_height";--> statement-breakpoint
ALTER TABLE "day" RENAME COLUMN "lastBlockHeight" TO "last_block_height";--> statement-breakpoint
ALTER TABLE "day" RENAME COLUMN "lastBlockHeightYet" TO "last_block_height_yet";--> statement-breakpoint
ALTER TABLE "day" RENAME COLUMN "aktPriceChanged" TO "token_price_changed";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "txId" TO "tx_id";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "typeCategory" TO "type_category";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "indexInBlock" TO "index_in_block";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "isProcessed" TO "is_processed";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "isNotificationProcessed" TO "is_notification_processed";--> statement-breakpoint
ALTER TABLE "monitored_value" RENAME COLUMN "lastUpdateDate" TO "last_update_date";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "msgCount" TO "msg_count";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "multisigThreshold" TO "multisig_threshold";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "gasUsed" TO "gas_used";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "gasWanted" TO "gas_wanted";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "isProcessed" TO "is_processed";--> statement-breakpoint
ALTER TABLE "transaction" RENAME COLUMN "hasProcessingError" TO "has_processing_error";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "operatorAddress" TO "operator_address";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "accountAddress" TO "account_address";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "hexAddress" TO "hex_address";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "createdMsgId" TO "created_msg_id";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "securityContact" TO "security_contact";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "maxRate" TO "max_rate";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "maxChangeRate" TO "max_change_rate";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "minSelfDelegation" TO "min_self_delegation";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "keybaseUsername" TO "keybase_username";--> statement-breakpoint
ALTER TABLE "validator" RENAME COLUMN "keybaseAvatarUrl" TO "keybase_avatar_url";--> statement-breakpoint
ALTER TABLE "collection" RENAME COLUMN "code_id" TO "market_contract";--> statement-breakpoint
ALTER TABLE "collection" RENAME COLUMN "cw721_instantiate_msg" TO "airdropped_tokens";--> statement-breakpoint
ALTER TABLE "nft" RENAME COLUMN "address" TO "owner";--> statement-breakpoint
ALTER TABLE "nft" RENAME COLUMN "for_sale_price" TO "image";--> statement-breakpoint
ALTER TABLE "nft" RENAME COLUMN "for_sale_denom" TO "name";--> statement-breakpoint
ALTER TABLE "nft" RENAME COLUMN "for_sale_block_height" TO "description";--> statement-breakpoint
ALTER TABLE "address_reference" DROP CONSTRAINT "addressReference_transactionId_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "address_reference" DROP CONSTRAINT "addressReference_messageId_message_id_fk";
--> statement-breakpoint
ALTER TABLE "block_event" DROP CONSTRAINT "blockEvent_height_block_height_fk";
--> statement-breakpoint
ALTER TABLE "block_event_attribute" DROP CONSTRAINT "blockEventAttribute_blockEventId_blockEvent_id_fk";
--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_txId_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "nft" DROP CONSTRAINT "nft_for_sale_block_height_block_height_fk";
--> statement-breakpoint
ALTER TABLE "nft_sale" DROP CONSTRAINT "nft_sale_nft_nft_id_fk";
--> statement-breakpoint
ALTER TABLE "nft_sale" DROP CONSTRAINT "nft_sale_sale_block_height_block_height_fk";
--> statement-breakpoint
ALTER TABLE "whitelist" DROP CONSTRAINT "whitelist_collection_collection_address_fk";
--> statement-breakpoint
DROP INDEX "nft_token_id";--> statement-breakpoint
DROP INDEX "address_reference_transaction_id";--> statement-breakpoint
DROP INDEX "block_day_id";--> statement-breakpoint
DROP INDEX "block_height_is_processed";--> statement-breakpoint
DROP INDEX "block_event_attribute_block_event_id_index";--> statement-breakpoint
DROP INDEX "day_first_block_height";--> statement-breakpoint
DROP INDEX "day_last_block_height";--> statement-breakpoint
DROP INDEX "message_tx_id";--> statement-breakpoint
DROP INDEX "message_tx_id_is_processed";--> statement-breakpoint
DROP INDEX "message_height_is_notification_processed";--> statement-breakpoint
DROP INDEX "transaction_height_is_processed_has_processing_error";--> statement-breakpoint
DROP INDEX "validator_operator_address";--> statement-breakpoint
DROP INDEX "validator_account_address";--> statement-breakpoint
DROP INDEX "validator_hex_address";--> statement-breakpoint
ALTER TABLE "block" ALTER COLUMN "datetime" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "block_event_attribute" ALTER COLUMN "value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "day" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "validator" ALTER COLUMN "rate" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "mint_contract" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "royalty_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "royalty_fee" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "royalty_fee" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "max_num_token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "per_address_limit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "start_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "unit_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "unit_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "unit_denom" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nft" ALTER COLUMN "token_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "nft" ALTER COLUMN "mint_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "nft_sale" ALTER COLUMN "sale_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "nft_sale" ALTER COLUMN "royalty_fee" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "nft_sale" ALTER COLUMN "royalty_fee_denom" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "nft_sale" ALTER COLUMN "royalty_fee_address" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "mintable_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "minted_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "collector_address" varchar(255);--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "trading_fee_bps" numeric;--> statement-breakpoint
ALTER TABLE "collection" ADD COLUMN "min_price" numeric;--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "external_url" varchar(255);--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "background_color" varchar(255);--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "animation_url" varchar(255);--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "youtube_url" varchar(255);--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "created_on_block_height" integer;--> statement-breakpoint
ALTER TABLE "nft" ADD COLUMN "active_listing_id" uuid;--> statement-breakpoint
ALTER TABLE "nft_sale" ADD COLUMN "market_fee" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "nft_sale" ADD COLUMN "market_fee_denom" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "whitelist" ADD COLUMN "address" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_event" ADD CONSTRAINT "transaction_event_height_block_height_fk" FOREIGN KEY ("height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_event" ADD CONSTRAINT "transaction_event_tx_id_transaction_id_fk" FOREIGN KEY ("tx_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaction_event_attribute" ADD CONSTRAINT "transaction_event_attribute_transaction_event_id_transaction_event_id_fk" FOREIGN KEY ("transaction_event_id") REFERENCES "public"."transaction_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_bid" ADD CONSTRAINT "nft_bid_nft_nft_id_fk" FOREIGN KEY ("nft") REFERENCES "public"."nft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_bid" ADD CONSTRAINT "nft_bid_bid_block_height_block_height_fk" FOREIGN KEY ("bid_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_bid" ADD CONSTRAINT "nft_bid_removed_block_height_block_height_fk" FOREIGN KEY ("removed_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_collection_bid" ADD CONSTRAINT "nft_collection_bid_collection_collection_address_fk" FOREIGN KEY ("collection") REFERENCES "public"."collection"("address") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "nft_collection_bid" ADD CONSTRAINT "nft_collection_bid_bid_block_height_block_height_fk" FOREIGN KEY ("bid_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_collection_bid" ADD CONSTRAINT "nft_collection_bid_removed_block_height_block_height_fk" FOREIGN KEY ("removed_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_listing" ADD CONSTRAINT "nft_listing_nft_nft_id_fk" FOREIGN KEY ("nft") REFERENCES "public"."nft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_listing" ADD CONSTRAINT "nft_listing_for_sale_block_height_block_height_fk" FOREIGN KEY ("for_sale_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_listing" ADD CONSTRAINT "nft_listing_unlisted_block_height_block_height_fk" FOREIGN KEY ("unlisted_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_transfer" ADD CONSTRAINT "nft_transfer_nft_id_nft_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_to_trait" ADD CONSTRAINT "nft_to_trait_nft_id_nft_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nft"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "nft_to_trait" ADD CONSTRAINT "nft_to_trait_trait_id_nft_trait_id_fk" FOREIGN KEY ("trait_id") REFERENCES "public"."nft_trait"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "nft_trait" ADD CONSTRAINT "nft_trait_collection_collection_address_fk" FOREIGN KEY ("collection") REFERENCES "public"."collection"("address") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "transaction_event_height_index" ON "transaction_event" USING btree ("height","index");--> statement-breakpoint
CREATE INDEX "transaction_event_tx_id_index" ON "transaction_event" USING btree ("tx_id","index");--> statement-breakpoint
CREATE INDEX "transaction_event_attribute_transaction_event_id_index" ON "transaction_event_attribute" USING btree ("transaction_event_id","index");--> statement-breakpoint
CREATE UNIQUE INDEX "nft_bid_owner_nft_where_removed_block_height_null" ON "nft_bid" USING btree ("owner","nft") WHERE "nft_bid"."removed_block_height" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "nft_collection_bid_owner_collection_where_removed_block_height_null" ON "nft_collection_bid" USING btree ("owner","collection") WHERE "nft_collection_bid"."removed_block_height" is null;--> statement-breakpoint
CREATE INDEX "nft_trait_collection" ON "nft_trait" USING btree ("collection");--> statement-breakpoint
ALTER TABLE "address_reference" ADD CONSTRAINT "address_reference_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "address_reference" ADD CONSTRAINT "address_reference_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_day_id_day_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."day"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_event" ADD CONSTRAINT "block_event_height_block_height_fk" FOREIGN KEY ("height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_event_attribute" ADD CONSTRAINT "block_event_attribute_block_event_id_block_event_id_fk" FOREIGN KEY ("block_event_id") REFERENCES "public"."block_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_tx_id_transaction_id_fk" FOREIGN KEY ("tx_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "nft" ADD CONSTRAINT "nft_created_on_block_height_block_height_fk" FOREIGN KEY ("created_on_block_height") REFERENCES "public"."block"("height") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "nft_sale" ADD CONSTRAINT "nft_sale_nft_nft_id_fk" FOREIGN KEY ("nft") REFERENCES "public"."nft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_sale" ADD CONSTRAINT "nft_sale_sale_block_height_block_height_fk" FOREIGN KEY ("sale_block_height") REFERENCES "public"."block"("height") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "block_height_where_is_processed_false" ON "block" USING btree ("height") WHERE is_processed = false;--> statement-breakpoint
CREATE UNIQUE INDEX "nft_collection_token_id" ON "nft" USING btree ("collection","token_id");--> statement-breakpoint
CREATE INDEX "nft_owner" ON "nft" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "nft_sale_nft" ON "nft_sale" USING btree ("nft");--> statement-breakpoint
CREATE INDEX "whitelist_collection" ON "whitelist" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "address_reference_transaction_id" ON "address_reference" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "block_day_id" ON "block" USING btree ("day_id");--> statement-breakpoint
CREATE INDEX "block_height_is_processed" ON "block" USING btree ("height","is_processed");--> statement-breakpoint
CREATE INDEX "block_event_attribute_block_event_id_index" ON "block_event_attribute" USING btree ("block_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "day_first_block_height" ON "day" USING btree ("first_block_height");--> statement-breakpoint
CREATE UNIQUE INDEX "day_last_block_height" ON "day" USING btree ("last_block_height");--> statement-breakpoint
CREATE INDEX "message_tx_id" ON "message" USING btree ("tx_id");--> statement-breakpoint
CREATE INDEX "message_tx_id_is_processed" ON "message" USING btree ("tx_id","is_processed");--> statement-breakpoint
CREATE INDEX "message_height_is_notification_processed" ON "message" USING btree ("height","is_notification_processed");--> statement-breakpoint
CREATE INDEX "transaction_height_is_processed_has_processing_error" ON "transaction" USING btree ("height","is_processed","has_processing_error");--> statement-breakpoint
CREATE UNIQUE INDEX "validator_operator_address" ON "validator" USING btree ("operator_address");--> statement-breakpoint
CREATE UNIQUE INDEX "validator_account_address" ON "validator" USING btree ("account_address");--> statement-breakpoint
CREATE UNIQUE INDEX "validator_hex_address" ON "validator" USING btree ("hex_address");