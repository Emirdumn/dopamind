import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .predictor import predictor


# ─── ADHD Knowledge Base for Chatbot ───────────────────────────────────
ADHD_KB = {
    "tr": {
        "what_is_adhd": "DEHB (Dikkat Eksikliği Hiperaktivite Bozukluğu), beynin dikkat, dürtü kontrolü ve yürütücü işlevlerini etkileyen nörogelişimsel bir bozukluktur. Dopamin ve norepinefrin nörotransmitter sistemlerindeki farklılıklarla ilişkilidir.",
        "symptoms": "DEHB'nin üç ana belirtisi vardır: Dikkat eksikliği (odaklanamama, unutkanlık, dağınıklık), Hiperaktivite (yerinde duramama, aşırı konuşma, sürekli hareket), Dürtüsellik (sabırsızlık, sıra bekleyememe, ani kararlar).",
        "treatment": "DEHB tedavisi genellikle ilaç tedavisi (metilfenidat, atomoksetin), bilişsel davranışçı terapi (BDT), yaşam düzenlemeleri ve destek araçlarının kombinasyonunu içerir.",
        "risk_high": "Yüksek risk sonucunuz, güçlü DEHB belirtileri gösterdiğinizi işaret ediyor. Bu kesin bir tanı değildir, ancak bir psikiyatrist veya klinik psikolog ile detaylı değerlendirme yapmanızı önemle öneriyoruz.",
        "risk_moderate": "Orta risk sonucunuz, bazı DEHB belirtileri taşıdığınızı gösteriyor. Günlük hayatınızı etkiliyorsa profesyonel değerlendirme faydalı olabilir.",
        "risk_low": "Düşük risk sonucunuz, belirgin DEHB belirtileri göstermediğinizi işaret ediyor. Ancak endişeleriniz varsa bir uzmanla görüşmekten çekinmeyin.",
        "women": "Kadınlarda DEHB genellikle dikkatsizlik ağırlıklıdır ve hiperaktivite daha az belirgindir. Bu nedenle kadınlarda tanı genellikle geç konur. İç huzursuzluk, duygusal düzensizlik ve aşırı düşünme kadınlarda daha yaygın belirtilerdir.",
        "children": "Çocuklarda DEHB belirtileri okul performansı, arkadaş ilişkileri ve aile içi dinamikleri etkileyebilir. Erken tanı ve müdahale çok önemlidir.",
        "adult": "Yetişkinlerde DEHB, iş performansı, ilişkiler ve günlük yaşam yönetimini etkiler. Çocukluktan farklı olarak hiperaktivite genellikle iç huzursuzluğa dönüşür.",
        "comorbidity": "DEHB sıklıkla anksiyete, depresyon, uyku bozuklukları ve öğrenme güçlükleri ile birlikte görülür. Komorbid durumların tedavisi DEHB yönetimini iyileştirebilir.",
        "default": "DEHB hakkında daha spesifik bir soru sorabilirsiniz. Belirtiler, tedavi, risk faktörleri veya günlük yaşam stratejileri hakkında bilgi verebilirim.",
    },
    "en": {
        "what_is_adhd": "ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental disorder affecting the brain's attention, impulse control, and executive functions. It's associated with differences in dopamine and norepinephrine neurotransmitter systems.",
        "symptoms": "ADHD has three main symptom types: Inattention (difficulty focusing, forgetfulness, disorganization), Hyperactivity (restlessness, excessive talking, constant movement), Impulsivity (impatience, difficulty waiting, snap decisions).",
        "treatment": "ADHD treatment typically involves a combination of medication (methylphenidate, atomoxetine), cognitive behavioral therapy (CBT), lifestyle modifications, and support tools.",
        "risk_high": "Your high-risk result indicates strong ADHD indicators. This is not a definitive diagnosis, but we strongly recommend a detailed evaluation with a psychiatrist or clinical psychologist.",
        "risk_moderate": "Your moderate-risk result shows some ADHD indicators. If it affects your daily life, professional evaluation may be beneficial.",
        "risk_low": "Your low-risk result indicates no prominent ADHD indicators. However, don't hesitate to consult a specialist if you have concerns.",
        "women": "ADHD in women is often predominantly inattentive, with hyperactivity being less prominent. This is why diagnosis in women is often delayed. Internal restlessness, emotional dysregulation, and overthinking are more common symptoms in women.",
        "children": "ADHD symptoms in children can affect school performance, friendships, and family dynamics. Early diagnosis and intervention are crucial.",
        "adult": "Adult ADHD affects work performance, relationships, and daily life management. Unlike childhood, hyperactivity usually transforms into internal restlessness.",
        "comorbidity": "ADHD frequently co-occurs with anxiety, depression, sleep disorders, and learning difficulties. Treating comorbid conditions can improve ADHD management.",
        "default": "Feel free to ask me a more specific question about ADHD. I can provide information about symptoms, treatment, risk factors, or daily life strategies.",
    },
}

# Keywords for chatbot intent matching
INTENT_KEYWORDS = {
    "what_is_adhd": ["nedir", "ne", "what", "adhd", "dehb", "tanım", "definition", "explain", "açıkla"],
    "symptoms": ["belirti", "semptom", "symptom", "sign", "bulgu", "finding", "nasıl anlarım", "how to know"],
    "treatment": ["tedavi", "ilaç", "terapi", "treatment", "therapy", "medication", "cure", "çözüm", "solution"],
    "women": ["kadın", "kız", "woman", "female", "girl", "bayan"],
    "children": ["çocuk", "child", "kid", "ergen", "teen", "adolescent", "genç", "young"],
    "adult": ["yetişkin", "adult", "büyük", "grown"],
    "comorbidity": ["komorbid", "eşlik", "birlikte", "anksiyete", "depresyon", "anxiety", "depression", "comorbid", "co-occur"],
    "risk_high": ["yüksek risk", "high risk", "tehlikeli", "dangerous", "kötü", "bad"],
    "risk_moderate": ["orta risk", "moderate", "orta"],
    "risk_low": ["düşük risk", "low risk", "iyi", "good"],
}

# ADHD-related keywords for "other" text evaluation
ADHD_KEYWORDS = {
    "attention": {
        "tr": ["dikkat", "odaklanma", "konsantrasyon", "dağınık", "unutkan", "dalma", "dikkatsiz", "odak"],
        "en": ["attention", "focus", "concentrate", "distracted", "forgetful", "zoning out", "inattentive"],
        "weight": 0.8,
    },
    "hyperactivity": {
        "tr": ["hiperaktif", "yerinde duramama", "kıpır kıpır", "sürekli hareket", "huzursuz", "sakin olamama"],
        "en": ["hyperactive", "restless", "fidgety", "can't sit still", "always moving", "restlessness"],
        "weight": 0.9,
    },
    "impulsivity": {
        "tr": ["dürtüsel", "sabırsız", "ani karar", "sıra bekleyememe", "kontrolsüz", "dürtü"],
        "en": ["impulsive", "impatient", "snap decision", "can't wait", "uncontrolled", "impulse"],
        "weight": 0.85,
    },
    "executive_function": {
        "tr": ["planlama", "organize", "düzen", "zaman yönetimi", "erteleme", "başlayamama", "bitirmek"],
        "en": ["planning", "organize", "order", "time management", "procrastination", "can't start", "finish"],
        "weight": 0.7,
    },
    "emotional": {
        "tr": ["duygusal", "sinirli", "kaygı", "stres", "hayal kırıklığı", "öfke", "ağlama", "ruh hali"],
        "en": ["emotional", "angry", "anxiety", "stress", "frustration", "rage", "crying", "mood"],
        "weight": 0.6,
    },
    "sleep": {
        "tr": ["uyku", "uykusuzluk", "uyuyamama", "geç yatma", "sabah kalkamama", "uyku düzeni"],
        "en": ["sleep", "insomnia", "can't sleep", "late bedtime", "can't wake up", "sleep pattern"],
        "weight": 0.5,
    },
    "social": {
        "tr": ["sosyal", "ilişki", "arkadaş", "iletişim", "yalnız", "dışlanma", "uyum"],
        "en": ["social", "relationship", "friend", "communication", "lonely", "excluded", "fitting in"],
        "weight": 0.4,
    },
}


@api_view(["POST"])
@permission_classes([AllowAny])
def assess_adhd(request):
    """
    ADHD Assessment API endpoint.
    Routes to child or adult model based on age.
    Now supports both detailed clinical scores and simple questionnaire answers.
    """
    data = request.data
    age_str = data.get("age", "")
    gender = data.get("gender", "other")
    answers = data.get("answers", {})

    if not age_str or not answers:
        return Response(
            {"error": "age and answers are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    is_child = age_str == "13-17"

    try:
        if is_child:
            result = _predict_child(answers, gender)
        else:
            result = _predict_adult(answers, age_str, gender)
    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(result)


@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot(request):
    """
    ADHD Chatbot endpoint.
    Provides information about ADHD based on user questions and assessment context.
    """
    message = request.data.get("message", "").strip()
    context = request.data.get("context", {})
    locale = request.data.get("locale", "tr")

    if not message:
        return Response(
            {"error": "message is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    kb = ADHD_KB.get(locale, ADHD_KB["tr"])
    response_text = _match_intent(message, kb, context, locale)

    return Response({
        "response": response_text,
        "locale": locale,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def evaluate_other(request):
    """
    Evaluate free-text 'other' responses for ADHD relevance.
    Uses keyword matching to extract clinical indicators.
    """
    text = request.data.get("text", "").strip()
    question_id = request.data.get("question_id", "")
    locale = request.data.get("locale", "tr")

    if not text:
        return Response(
            {"error": "text is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    results = _analyze_text(text, locale)

    return Response({
        "text": text,
        "question_id": question_id,
        "adhd_relevance": results["total_score"],
        "categories": results["categories"],
        "matched_keywords": results["matched_keywords"],
        "clinical_note": results["clinical_note"],
    })


def _match_intent(message: str, kb: dict, context: dict, locale: str) -> str:
    """Match user message to knowledge base intent."""
    msg_lower = message.lower()

    # Check for risk-specific questions if context has results
    risk_level = context.get("risk_level", "")
    if risk_level and any(w in msg_lower for w in ["sonuç", "result", "ne anlama", "what does", "meaning", "yorumla", "interpret"]):
        return kb.get(f"risk_{risk_level}", kb["default"])

    # Match intent by keywords
    best_intent = "default"
    best_score = 0

    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg_lower)
        if score > best_score:
            best_score = score
            best_intent = intent

    response = kb.get(best_intent, kb["default"])

    # Enrich with context if available
    if context.get("adhd_probability") and best_intent in ("risk_high", "risk_moderate", "risk_low"):
        prob = context["adhd_probability"]
        if locale == "tr":
            response += f"\n\nSizin DEHB olasılığınız: %{round(prob * 100)}"
        else:
            response += f"\n\nYour ADHD probability: {round(prob * 100)}%"

    return response


def _analyze_text(text: str, locale: str) -> dict:
    """Analyze free text for ADHD-related keywords and indicators."""
    text_lower = text.lower()
    categories = {}
    all_matched = []
    total_score = 0.0

    for category, data in ADHD_KEYWORDS.items():
        keywords = data.get(locale, data.get("tr", []))
        weight = data["weight"]
        matched = [kw for kw in keywords if kw in text_lower]

        if matched:
            cat_score = min(1.0, len(matched) * 0.3) * weight
            categories[category] = {
                "score": round(cat_score, 3),
                "matched": matched,
                "weight": weight,
            }
            all_matched.extend(matched)
            total_score += cat_score

    total_score = round(min(1.0, total_score), 3)

    # Generate clinical note
    if locale == "tr":
        if total_score > 0.6:
            note = "Girdiğiniz metin güçlü DEHB ilişkili göstergeler içeriyor. Bu bilgi değerlendirmenize dahil edildi."
        elif total_score > 0.3:
            note = "Girdiğiniz metinde bazı DEHB ilişkili göstergeler tespit edildi."
        else:
            note = "Girdiğiniz metin doğrudan DEHB göstergeleri içermiyor, ancak değerlendirmeye dahil edildi."
    else:
        if total_score > 0.6:
            note = "Your text contains strong ADHD-related indicators. This information has been included in your assessment."
        elif total_score > 0.3:
            note = "Some ADHD-related indicators were detected in your text."
        else:
            note = "Your text doesn't contain direct ADHD indicators, but it has been included in the assessment."

    return {
        "total_score": total_score,
        "categories": categories,
        "matched_keywords": all_matched,
        "clinical_note": note,
    }


def _predict_child(answers, gender):
    """Map frontend answers to WiDS model features."""
    # Check if detailed clinical scores are provided (new format)
    clinical = answers.get("clinical", {})

    if clinical:
        # Direct clinical scores from detailed questionnaire
        hyperactivity = clinical.get("sdq_hyperactivity", 20)
        conduct = clinical.get("sdq_conduct", 5)
        emotional = clinical.get("sdq_emotional", 5)
        peer = clinical.get("sdq_peer", 5)
        prosocial = clinical.get("sdq_prosocial", 25)
        impact = clinical.get("sdq_impact", 3)

        apq_inv = clinical.get("apq_involvement", 12)
        apq_pp = clinical.get("apq_positive_parenting", 12)
        apq_cp = clinical.get("apq_corporal_punishment", 5)
        apq_id = clinical.get("apq_inconsistent_discipline", 6)
        apq_pm = clinical.get("apq_poor_monitoring", 5)
        apq_opd = clinical.get("apq_other_discipline", 6)

        ehq = clinical.get("ehq_handedness", 80)
        color_vision = clinical.get("color_vision", 14)
        edu = clinical.get("barratt_edu", 3)
        age_scan = clinical.get("age", 15)
    else:
        # Legacy: approximate from simple answers
        challenges = answers.get("challenges", [])

        focus_map = {"5min": 40, "5-15": 32, "15-30": 20, "30-60": 10, "60+": 4}
        focus_score = focus_map.get(answers.get("focusDuration", "15-30"), 20)

        sleep_map = {"very_bad": 10, "bad": 8, "average": 5, "good": 2, "very_good": 0}
        sleep_score = sleep_map.get(answers.get("sleepQuality", "average"), 5)

        stress_map = {"very_high": 10, "high": 8, "moderate": 5, "low": 2, "very_low": 0}
        stress_score = stress_map.get(answers.get("stressLevel", "moderate"), 5)

        screen_map = {"1-2": 2, "3-4": 5, "5-6": 8, "7-8": 10, "9+": 10}
        screen_score = screen_map.get(answers.get("screenTime", "3-4"), 5)

        has_focus = "focus" in challenges
        has_hyperactivity = "hyperactivity" in challenges
        has_anxiety = "anxiety" in challenges
        has_social = "social" in challenges

        hyperactivity = min(50, focus_score + (10 if has_hyperactivity else 0) + (5 if has_focus else 0))
        conduct = 8 if has_hyperactivity else 3
        emotional = min(50, sleep_score + stress_score + (8 if has_anxiety else 0))
        peer = 10 if has_social else 3
        prosocial = 25
        impact = min(10, len(challenges))

        apq_inv = 12
        apq_pp = 12
        apq_cp = 5
        apq_id = 6
        apq_pm = 5
        apq_opd = 6
        ehq = 80
        color_vision = 14

        edu_map = {"highschool": 3, "university": 4, "masters": 5, "phd": 5, "other": 3}
        edu = edu_map.get(answers.get("education", "other"), 3)
        age_scan = 15

    # Factor in "other" text analysis if present
    other_scores = answers.get("other_analysis", {})
    if other_scores:
        attn_boost = other_scores.get("attention", {}).get("score", 0)
        hyper_boost = other_scores.get("hyperactivity", {}).get("score", 0)
        emotional_boost = other_scores.get("emotional", {}).get("score", 0)
        hyperactivity = min(50, hyperactivity + int(hyper_boost * 10))
        emotional = min(50, emotional + int(emotional_boost * 8))
        impact = min(10, impact + int(attn_boost * 3))

    features = {
        "SDQ_SDQ_Hyperactivity": hyperactivity,
        "SDQ_SDQ_Conduct_Problems": conduct,
        "SDQ_SDQ_Emotional_Problems": emotional,
        "SDQ_SDQ_Peer_Problems": peer,
        "SDQ_SDQ_Prosocial": prosocial,
        "SDQ_SDQ_Difficulties_Total": hyperactivity + conduct + emotional + peer,
        "SDQ_SDQ_Externalizing": hyperactivity + conduct,
        "SDQ_SDQ_Internalizing": emotional + peer,
        "SDQ_SDQ_Generating_Impact": impact,
        "APQ_P_APQ_P_INV": apq_inv,
        "APQ_P_APQ_P_PP": apq_pp,
        "APQ_P_APQ_P_CP": apq_cp,
        "APQ_P_APQ_P_ID": apq_id,
        "APQ_P_APQ_P_PM": apq_pm,
        "APQ_P_APQ_P_OPD": apq_opd,
        "EHQ_EHQ_Total": ehq,
        "ColorVision_CV_Score": color_vision,
        "Barratt_Barratt_P1_Edu": edu,
        "Barratt_Barratt_P2_Edu": edu,
        "MRI_Track_Age_at_Scan": age_scan,
    }

    result = predictor.predict_child(features)
    result["subscores"] = {
        "hyperactivity": hyperactivity,
        "conduct_problems": conduct,
        "emotional_problems": emotional,
        "peer_problems": peer,
        "prosocial": prosocial,
        "total_difficulties": hyperactivity + conduct + emotional + peer,
        "impact": impact,
    }
    return result


def _predict_adult(answers, age_str, gender):
    """Map frontend answers to HYPERAKTIV model features."""
    clinical = answers.get("clinical", {})

    if clinical:
        # Direct clinical scores from detailed questionnaire
        age_map = {"18-24": 1, "25-34": 2, "35-44": 3, "45+": 4}
        age_code = age_map.get(age_str, 2)
        sex_val = 1 if gender == "female" else 0

        wurs = clinical.get("wurs", 30)
        asrs = clinical.get("asrs", 20)
        madrs = clinical.get("madrs", 10)
        hads_a = clinical.get("hads_anxiety", 7)
        hads_d = clinical.get("hads_depression", 5)

        add_flag = clinical.get("add", 0)
        bipolar = clinical.get("bipolar", 0)
        unipolar = clinical.get("unipolar", 0)
        anxiety_flag = clinical.get("anxiety_disorder", 0)
        substance = clinical.get("substance", 0)
        other_flag = clinical.get("other_comorbid", 0)
    else:
        # Legacy: approximate from simple answers
        challenges = answers.get("challenges", [])

        age_map = {"18-24": 1, "25-34": 2, "35-44": 3, "45+": 4}
        age_code = age_map.get(age_str, 2)
        sex_val = 1 if gender == "female" else 0

        focus_map = {"5min": 60, "5-15": 48, "15-30": 30, "30-60": 15, "60+": 5}
        focus_score = focus_map.get(answers.get("focusDuration", "15-30"), 30)

        sleep_map = {"very_bad": 16, "bad": 12, "average": 7, "good": 3, "very_good": 1}
        sleep_score = sleep_map.get(answers.get("sleepQuality", "average"), 7)

        stress_map = {"very_high": 18, "high": 14, "moderate": 8, "low": 4, "very_low": 1}
        stress_score = stress_map.get(answers.get("stressLevel", "moderate"), 8)

        screen_map = {"1-2": 0, "3-4": 5, "5-6": 10, "7-8": 15, "9+": 20}
        screen_add = screen_map.get(answers.get("screenTime", "3-4"), 5)

        has_focus = "focus" in challenges
        has_hyperactivity = "hyperactivity" in challenges
        has_organization = "organization" in challenges
        has_procrastination = "procrastination" in challenges
        has_anxiety = "anxiety" in challenges
        has_memory = "memory" in challenges
        has_motivation = "motivation" in challenges

        wurs = min(100, focus_score + screen_add
                   + (15 if has_focus else 0)
                   + (12 if has_hyperactivity else 0)
                   + (10 if has_organization else 0)
                   + (8 if has_procrastination else 0)
                   + (5 if has_memory else 0))

        asrs = min(72, int(focus_score * 0.8) + screen_add
                   + (10 if has_focus else 0)
                   + (8 if has_hyperactivity else 0)
                   + (6 if has_organization else 0)
                   + (5 if has_procrastination else 0)
                   + (4 if has_memory else 0)
                   + (3 if has_motivation else 0))

        hads_a = min(21, int(stress_score * 0.6) + (5 if has_anxiety else 0))
        hads_d = min(21, int(sleep_score * 0.4) + (3 if has_motivation else 0))
        madrs = min(60, sleep_score + hads_d + (5 if has_motivation else 0))

        add_flag = 0
        bipolar = 0
        unipolar = 0
        anxiety_flag = 1 if has_anxiety else 0
        substance = 0
        other_flag = 0

    # Factor in "other" text analysis if present
    other_scores = answers.get("other_analysis", {})
    if other_scores:
        attn_boost = other_scores.get("attention", {}).get("score", 0)
        hyper_boost = other_scores.get("hyperactivity", {}).get("score", 0)
        emotional_boost = other_scores.get("emotional", {}).get("score", 0)
        wurs = min(100, wurs + int(hyper_boost * 15))
        asrs = min(72, asrs + int(attn_boost * 12))
        hads_a = min(21, hads_a + int(emotional_boost * 5))

    features = {
        "SEX": sex_val,
        "AGE": age_code,
        "WURS": wurs,
        "ASRS": asrs,
        "MADRS": madrs,
        "HADS_A": hads_a,
        "HADS_D": hads_d,
        "ADD": add_flag,
        "BIPOLAR": bipolar,
        "UNIPOLAR": unipolar,
        "ANXIETY": anxiety_flag,
        "SUBSTANCE": substance,
        "OTHER": other_flag,
    }

    result = predictor.predict_adult(features)
    result["subscores"] = {
        "wurs_childhood": wurs,
        "asrs_current": asrs,
        "anxiety": hads_a,
        "depression": hads_d,
        "madrs": madrs,
    }
    return result
