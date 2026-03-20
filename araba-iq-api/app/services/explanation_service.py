from decimal import Decimal
from typing import Optional


def market_price_comment(
    sample_size: int,
    std_dev_price: Optional[Decimal],
    avg_price: Optional[Decimal],
) -> str:
    if sample_size < 5:
        return "Örneklem küçük; fiyat bandı güvenilir olmayabilir."
    if std_dev_price is None or avg_price is None or avg_price == 0:
        return "Piyasa özeti için yeterli veri yok."
    ratio = float(std_dev_price) / float(avg_price)
    if ratio < 0.05:
        return "Fiyatlar birbirine yakın; piyasada dar bir bantta kümeleniyor."
    if ratio < 0.12:
        return "Fiyat dağılımı orta seviyede; tipik bir piyasa yayılımı."
    return "Fiyatlar geniş bir aralıkta; ilanlar arasında belirgin fark var."
