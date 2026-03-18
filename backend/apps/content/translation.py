from modeltranslation.translator import translator, TranslationOptions
from .models import ContentCategory, Article, Video


class ContentCategoryTranslationOptions(TranslationOptions):
    fields = ("name",)


class ArticleTranslationOptions(TranslationOptions):
    fields = ("title", "excerpt", "body", "meta_title", "meta_description")


class VideoTranslationOptions(TranslationOptions):
    fields = ("title", "description")


translator.register(ContentCategory, ContentCategoryTranslationOptions)
translator.register(Article, ArticleTranslationOptions)
translator.register(Video, VideoTranslationOptions)
