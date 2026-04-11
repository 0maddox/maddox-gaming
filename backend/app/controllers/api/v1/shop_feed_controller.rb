class Api::V1::ShopFeedController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]
  DEFAULT_TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@maddox_gaming_supplies'.freeze
  DEFAULT_WHATSAPP_CATALOG_URL = 'https://wa.me/c/254748376744'.freeze

  def index
    tiktok_profile_url = ENV['TIKTOK_SHOP_PROFILE_URL'].presence || DEFAULT_TIKTOK_PROFILE_URL
    whatsapp_catalog_url = ENV['WHATSAPP_CATALOG_PUBLIC_URL'].presence || DEFAULT_WHATSAPP_CATALOG_URL

    tiktok_items, tiktok_status = fetch_tiktok_items
    whatsapp_items, whatsapp_status = fetch_whatsapp_items

    fallback_products = Product.all.map { |product| normalize_product_record(product) }

    items = (tiktok_items + whatsapp_items)
    items = fallback_products if items.empty?
    if items.empty?
      fallback_items = []

      if tiktok_profile_url.present?
        fallback_items << normalize_item(
          source: 'tiktok',
          id: 'tiktok-profile',
          title: 'Browse Maddox Gaming Supplies on TikTok',
          category: 'for-you',
          description: 'Tap to view current posts, item prices, offers, and discounts.',
          image_url: nil,
          external_url: tiktok_profile_url,
          price: nil,
          currency: 'USD',
          discount_percent: nil,
          offer_label: 'TikTok Shop'
        )
      end

      if whatsapp_catalog_url.present?
        fallback_items << normalize_item(
          source: 'whatsapp',
          id: 'whatsapp-catalog',
          title: 'Browse Maddox Gaming Supplies on WhatsApp',
          category: 'for-you',
          description: 'Open the WhatsApp catalog to see available products and prices.',
          image_url: nil,
          external_url: whatsapp_catalog_url,
          price: nil,
          currency: 'KES',
          discount_percent: nil,
          offer_label: 'WhatsApp Catalog'
        )
      end

      items = fallback_items.compact if fallback_items.any?
    end

    render json: {
      items: items,
      source_links: {
        tiktok_profile: tiktok_profile_url,
        whatsapp_catalog: whatsapp_catalog_url
      },
      source_status: {
        tiktok: tiktok_status,
        whatsapp: whatsapp_status,
        fallback_products: fallback_products.any? ? 'used_when_external_empty' : 'empty'
      }
    }
  end

  private

  def fetch_tiktok_items
    url = ENV['TIKTOK_SHOP_FEED_URL']
    token = ENV['TIKTOK_ACCESS_TOKEN']
    return [[], 'not_configured'] if url.blank?

    payload = fetch_json(url, token)
    return [[], 'fetch_failed'] if payload.nil?

    items = payload_items(payload).map do |entry|
      normalize_item(
        source: 'tiktok',
        id: entry['id'] || entry['video_id'] || entry['product_id'],
        title: entry['title'] || entry['name'] || 'TikTok item',
        category: normalize_category(first_present(entry, %w[category product_category])),
        description: entry['description'] || entry['caption'],
        image_url: first_present(entry, %w[image_url cover_url thumbnail image]),
        external_url: first_present(entry, %w[url product_url share_url]),
        price: numeric_value(first_present(entry, %w[price sale_price amount])),
        currency: first_present(entry, %w[currency currency_code]) || 'USD',
        discount_percent: numeric_value(first_present(entry, %w[discount discount_percent]))
      )
    end.compact

    [items, 'ok']
  rescue StandardError
    [[], 'fetch_failed']
  end

  def fetch_whatsapp_items
    url = ENV['WHATSAPP_CATALOG_URL']
    token = ENV['WHATSAPP_ACCESS_TOKEN']
    return [[], 'not_configured'] if url.blank?

    payload = fetch_json(url, token)
    return [[], 'fetch_failed'] if payload.nil?

    items = payload_items(payload).map do |entry|
      raw_price = first_present(entry, %w[price amount])
      compare_price = first_present(entry, %w[compare_at_price original_price])
      price = numeric_value(raw_price)
      compare = numeric_value(compare_price)

      discount = if compare && price && compare.positive? && compare > price
        (((compare - price) / compare) * 100.0).round(1)
      else
        numeric_value(first_present(entry, %w[discount discount_percent]))
      end

      normalize_item(
        source: 'whatsapp',
        id: entry['id'] || entry['retailer_id'],
        title: entry['name'] || entry['title'] || 'WhatsApp catalog item',
        category: normalize_category(first_present(entry, %w[category product_category])),
        description: entry['description'],
        image_url: first_present(entry, %w[image_url image]),
        external_url: first_present(entry, %w[url product_url]),
        price: price,
        currency: first_present(entry, %w[currency currency_code]) || 'USD',
        discount_percent: discount,
        offer_label: first_present(entry, %w[sale_label offer promo])
      )
    end.compact

    [items, 'ok']
  rescue StandardError
    [[], 'fetch_failed']
  end

  def fetch_json(url, token)
    uri = URI.parse(url)
    request = Net::HTTP::Get.new(uri)
    request['Authorization'] = "Bearer #{token}" if token.present?

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end

    return nil unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  rescue StandardError
    nil
  end

  def payload_items(payload)
    return payload if payload.is_a?(Array)

    payload['data'] || payload['items'] || payload['products'] || payload['videos'] || []
  end

  def normalize_product_record(product)
    normalize_item(
      source: 'products',
      id: product.id,
      title: product.name,
      category: normalize_category(product.category),
      description: product.description,
      image_url: product.image_url,
      external_url: nil,
      price: numeric_value(product.price),
      currency: 'USD',
      discount_percent: nil
    )
  end

  def normalize_item(source:, id:, title:, category:, description:, image_url:, external_url:, price:, currency:, discount_percent:, offer_label: nil)
    return nil if title.blank?

    {
      id: id,
      source: source,
      title: title,
      category: category.presence || 'for-you',
      description: description,
      image_url: image_url,
      external_url: external_url,
      price: price,
      currency: currency,
      discount_percent: discount_percent,
      offer_label: offer_label
    }
  end

  def first_present(hash, keys)
    keys.each do |key|
      value = hash[key]
      return value if value.present?
    end
    nil
  end

  def numeric_value(value)
    return nil if value.nil?

    value.to_f
  rescue StandardError
    nil
  end

  def normalize_category(value)
    value.to_s.strip.downcase.presence || 'for-you'
  end
end
