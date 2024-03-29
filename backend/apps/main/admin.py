from django.contrib import admin
from main.models import Trade


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    fields = (
        'exchange',
        'symbol',
        'quantity',
        'trade_type',
        'loop',
        'completed_loops',
        'time_interval',
        'is_completed',
        'completed_at',
        'user',
        'price',
        'filled',
        'iceberg',
        'icebergs_count',
        'iceberg_prices_sum',
        'iceberg_price',
        'take_profit',
        'take_profit_percent',
        'completed_icebergs',
        'ladder',
        'ladder_trades_count',
        'ladder_start_price',
        'ladder_end_price',
        'ladder_order_ids',
        'ladder_prices_sum',
        'ladder_completed_orders',
        'market_making',
        'market_making_array',
        'chase_bot',
        'twap_bot',
        'twap_bot_duration',
        'twap_bot_completed_trades',
        'grid_bot',
        'grid_trades_count',
        'grid_start_price',
        'grid_end_price',
        'hft_bot',
        'hft_default_price_difference',
        'hft_orders_price_difference',
        'hft_orders_on_each_side',
        'hft_order_ids',
        'hft_orders_check_time',
        'hft_buy_orders',
        'hft_sell_orders',
        'stop',
        'stop_percent',
        'stop_price',
        'limit',
        'limit_price',
        'market',
        'order_id',
        'active_order_ids',
        'reduce_only',
        'post_only',
    )
    list_display = (
        'user',
        'exchange',
        'is_completed'
    )

    readonly_fields = fields
