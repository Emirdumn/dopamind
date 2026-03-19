from django.urls import path
from . import views

urlpatterns = [
    path("assess/", views.assess_adhd, name="assess-adhd"),
]
