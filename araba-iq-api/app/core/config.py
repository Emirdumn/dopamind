from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "ArabaIQ"
    segmento_tagline: str = "Segmento — segment ve filtre motoru"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://araba_iq:changeme@localhost:5433/araba_iq"
    # Virgülle ayrılmış origin listesi; boşsa CORS kapalı
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"


settings = Settings()
