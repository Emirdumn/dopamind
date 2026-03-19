from django.urls import path
from . import views

urlpatterns = [
    path("assess/", views.assess_adhd, name="assess-adhd"),
    path("chatbot/", views.chatbot, name="assessment-chatbot"),
    path("evaluate-other/", views.evaluate_other, name="evaluate-other"),
]
