# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_04_17_103000) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "carts", force: :cascade do |t|
    t.integer "user_id", null: false
    t.json "items", default: [], null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_carts_on_user_id", unique: true
  end

  create_table "codm_player_stats", force: :cascade do |t|
    t.integer "team_profile_id"
    t.string "player_name", null: false
    t.string "in_game_rank", default: "Rookie", null: false
    t.integer "kills", default: 0, null: false
    t.integer "matches_played", default: 0, null: false
    t.integer "wins", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kills"], name: "index_codm_player_stats_on_kills"
    t.index ["player_name"], name: "index_codm_player_stats_on_player_name"
    t.index ["team_profile_id"], name: "index_codm_player_stats_on_team_profile_id"
  end

  create_table "discussion_comments", force: :cascade do |t|
    t.integer "discussion_thread_id", null: false
    t.integer "user_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discussion_thread_id"], name: "index_discussion_comments_on_discussion_thread_id"
    t.index ["user_id"], name: "index_discussion_comments_on_user_id"
  end

  create_table "discussion_threads", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "title", null: false
    t.text "body", null: false
    t.string "topic_type"
    t.integer "topic_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["topic_type", "topic_id"], name: "index_discussion_threads_on_topic_type_and_topic_id"
    t.index ["user_id"], name: "index_discussion_threads_on_user_id"
  end

  create_table "follows", force: :cascade do |t|
    t.integer "follower_id", null: false
    t.integer "followed_id", null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followed_id"], name: "index_follows_on_followed_id"
    t.index ["follower_id", "followed_id"], name: "index_follows_on_follower_id_and_followed_id", unique: true
    t.index ["follower_id"], name: "index_follows_on_follower_id"
    t.index ["status"], name: "index_follows_on_status"
  end

  create_table "lft_posts", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "game_title", default: "CODM", null: false
    t.string "role_needed", null: false
    t.string "rank_requirement"
    t.string "region"
    t.integer "slots_open", default: 1, null: false
    t.text "notes"
    t.string "status", default: "open", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_title"], name: "index_lft_posts_on_game_title"
    t.index ["status"], name: "index_lft_posts_on_status"
    t.index ["user_id"], name: "index_lft_posts_on_user_id"
  end

  create_table "orders", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "status", default: "pending", null: false
    t.string "payment_method", null: false
    t.string "payment_reference"
    t.string "payment_phone"
    t.decimal "total_amount", precision: 12, scale: 2, default: "0.0", null: false
    t.json "items", default: [], null: false
    t.json "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "transaction_id"
    t.string "gateway_name", default: "flutterwave", null: false
    t.string "currency", default: "KES", null: false
    t.datetime "paid_at"
    t.index ["gateway_name"], name: "index_orders_on_gateway_name"
    t.index ["payment_reference"], name: "index_orders_on_payment_reference", unique: true
    t.index ["status"], name: "index_orders_on_status"
    t.index ["transaction_id"], name: "index_orders_on_transaction_id"
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.decimal "price"
    t.integer "stock"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "category", default: "for-you", null: false
    t.string "image_url"
    t.string "color"
    t.string "variant_model"
    t.string "compatibility"
    t.json "variants", default: [], null: false
    t.integer "low_stock_threshold", default: 5, null: false
    t.index ["category"], name: "index_products_on_category"
  end

  create_table "registrations", force: :cascade do |t|
    t.integer "user_id"
    t.integer "tournament_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "team_profile_id"
    t.index ["team_profile_id", "tournament_id"], name: "index_registrations_on_team_and_tournament", unique: true, where: "team_profile_id IS NOT NULL"
    t.index ["team_profile_id"], name: "index_registrations_on_team_profile_id"
    t.index ["tournament_id"], name: "index_registrations_on_tournament_id"
    t.index ["user_id", "tournament_id"], name: "index_registrations_on_user_id_and_tournament_id", unique: true
    t.index ["user_id"], name: "index_registrations_on_user_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "product_id", null: false
    t.integer "rating", null: false
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "created_at"], name: "index_reviews_on_product_id_and_created_at"
    t.index ["product_id", "rating"], name: "index_reviews_on_product_id_and_rating"
    t.index ["product_id"], name: "index_reviews_on_product_id"
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "team_profiles", force: :cascade do |t|
    t.string "name", null: false
    t.string "tag", null: false
    t.string "region"
    t.integer "wins", default: 0, null: false
    t.integer "losses", default: 0, null: false
    t.text "bio"
    t.string "logo_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag"], name: "index_team_profiles_on_tag", unique: true
  end

  create_table "tournament_matches", force: :cascade do |t|
    t.integer "tournament_id", null: false
    t.integer "player_one_id"
    t.integer "player_two_id"
    t.integer "winner_id"
    t.integer "player_one_score", default: 0, null: false
    t.integer "player_two_score", default: 0, null: false
    t.integer "round_number", default: 1, null: false
    t.integer "position_in_round", default: 1, null: false
    t.string "bracket_side", default: "winners", null: false
    t.string "status", default: "pending", null: false
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "player_one_team_id"
    t.integer "player_two_team_id"
    t.integer "winner_team_id"
    t.index ["player_one_id"], name: "index_tournament_matches_on_player_one_id"
    t.index ["player_one_team_id"], name: "index_tournament_matches_on_player_one_team_id"
    t.index ["player_two_id"], name: "index_tournament_matches_on_player_two_id"
    t.index ["player_two_team_id"], name: "index_tournament_matches_on_player_two_team_id"
    t.index ["tournament_id", "round_number", "position_in_round"], name: "index_tournament_matches_on_round_slot", unique: true
    t.index ["tournament_id"], name: "index_tournament_matches_on_tournament_id"
    t.index ["winner_id"], name: "index_tournament_matches_on_winner_id"
    t.index ["winner_team_id"], name: "index_tournament_matches_on_winner_team_id"
  end

  create_table "tournaments", force: :cascade do |t|
    t.string "name"
    t.datetime "date"
    t.decimal "entry_fee"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status", default: "draft", null: false
    t.string "format_type", default: "single_elimination", null: false
    t.integer "max_players", default: 16, null: false
    t.string "game_title", default: "CODM", null: false
    t.json "bracket_data", default: {}, null: false
    t.boolean "live_updates_enabled", default: true, null: false
    t.string "team_mode", default: "solo", null: false
    t.index ["format_type"], name: "index_tournaments_on_format_type"
    t.index ["status"], name: "index_tournaments_on_status"
    t.index ["team_mode"], name: "index_tournaments_on_team_mode"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "username"
    t.string "phone_number"
    t.string "password_digest"
    t.boolean "admin", default: false, null: false
    t.string "role", default: "user", null: false
    t.string "password_reset_token_digest"
    t.datetime "password_reset_sent_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["password_reset_token_digest"], name: "index_users_on_password_reset_token_digest", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "carts", "users"
  add_foreign_key "codm_player_stats", "team_profiles"
  add_foreign_key "discussion_comments", "discussion_threads"
  add_foreign_key "discussion_comments", "users"
  add_foreign_key "discussion_threads", "users"
  add_foreign_key "follows", "users", column: "followed_id"
  add_foreign_key "follows", "users", column: "follower_id"
  add_foreign_key "lft_posts", "users"
  add_foreign_key "orders", "users"
  add_foreign_key "registrations", "team_profiles"
  add_foreign_key "registrations", "tournaments"
  add_foreign_key "registrations", "users"
  add_foreign_key "reviews", "products"
  add_foreign_key "reviews", "users"
  add_foreign_key "tournament_matches", "team_profiles", column: "player_one_team_id"
  add_foreign_key "tournament_matches", "team_profiles", column: "player_two_team_id"
  add_foreign_key "tournament_matches", "team_profiles", column: "winner_team_id"
  add_foreign_key "tournament_matches", "tournaments"
  add_foreign_key "tournament_matches", "users", column: "player_one_id"
  add_foreign_key "tournament_matches", "users", column: "player_two_id"
  add_foreign_key "tournament_matches", "users", column: "winner_id"
end
