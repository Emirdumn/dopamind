from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .predictor import predictor


@api_view(["POST"])
def assess_adhd(request):
    """
    ADHD Assessment API endpoint.
    Routes to child or adult model based on age.

    Expected payload:
    {
        "age": "18-24",          # age group string
        "gender": "female",      # male/female/other
        "answers": { ... }       # questionnaire answers
    }
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


def _predict_child(answers, gender):
    """Map frontend answers to WiDS model features."""
    # Map challenge selections to SDQ scores
    challenges = answers.get("challenges", [])

    # Focus duration -> hyperactivity indicator
    focus_map = {"5min": 40, "5-15": 32, "15-30": 20, "30-60": 10, "60+": 4}
    focus_score = focus_map.get(answers.get("focusDuration", "15-30"), 20)

    # Sleep quality -> emotional indicator
    sleep_map = {"very_bad": 10, "bad": 8, "average": 5, "good": 2, "very_good": 0}
    sleep_score = sleep_map.get(answers.get("sleepQuality", "average"), 5)

    # Stress -> emotional indicator
    stress_map = {"very_high": 10, "high": 8, "moderate": 5, "low": 2, "very_low": 0}
    stress_score = stress_map.get(answers.get("stressLevel", "moderate"), 5)

    # Screen time -> attention indicator
    screen_map = {"1-2": 2, "3-4": 5, "5-6": 8, "7-8": 10, "9+": 10}
    screen_score = screen_map.get(answers.get("screenTime", "3-4"), 5)

    # Challenge-based scoring
    has_focus = "focus" in challenges
    has_hyperactivity = "hyperactivity" in challenges
    has_organization = "organization" in challenges
    has_procrastination = "procrastination" in challenges
    has_anxiety = "anxiety" in challenges
    has_memory = "memory" in challenges
    has_social = "social" in challenges
    has_sleep = "sleep" in challenges

    # Build SDQ subscales from answers
    hyperactivity = min(50, focus_score + (10 if has_hyperactivity else 0) + (5 if has_focus else 0))
    conduct = 8 if has_hyperactivity else 3
    emotional = min(50, sleep_score + stress_score + (8 if has_anxiety else 0))
    peer = 10 if has_social else 3
    prosocial = 25  # neutral default
    impact = min(10, len(challenges))

    # Education -> Barratt
    edu_map = {"highschool": 3, "university": 4, "masters": 5, "phd": 5, "other": 3}
    edu = edu_map.get(answers.get("education", "other"), 3)

    # Sex
    sex_val = 1 if gender == "female" else 0

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
        "APQ_P_APQ_P_INV": 12,  # neutral defaults for parenting
        "APQ_P_APQ_P_PP": 12,
        "APQ_P_APQ_P_CP": 5,
        "APQ_P_APQ_P_ID": 6,
        "APQ_P_APQ_P_PM": 5,
        "APQ_P_APQ_P_OPD": 6,
        "EHQ_EHQ_Total": 80,  # mostly right-handed default
        "ColorVision_CV_Score": 14,
        "Barratt_Barratt_P1_Edu": edu,
        "Barratt_Barratt_P2_Edu": edu,
        "MRI_Track_Age_at_Scan": 15,  # teen default
    }

    result = predictor.predict_child(features)
    result["subscores"] = {
        "hyperactivity": hyperactivity,
        "conduct_problems": conduct,
        "emotional_problems": emotional,
        "peer_problems": peer,
        "total_difficulties": hyperactivity + conduct + emotional + peer,
        "impact": impact,
    }
    return result


def _predict_adult(answers, age_str, gender):
    """Map frontend answers to HYPERAKTIV model features."""
    challenges = answers.get("challenges", [])

    # Age group mapping
    age_map = {"18-24": 1, "25-34": 2, "35-44": 3, "45+": 4}
    age_code = age_map.get(age_str, 2)

    # Sex
    sex_val = 1 if gender == "female" else 0

    # Focus duration -> ASRS-like score
    focus_map = {"5min": 60, "5-15": 48, "15-30": 30, "30-60": 15, "60+": 5}
    focus_score = focus_map.get(answers.get("focusDuration", "15-30"), 30)

    # Sleep quality -> affects HADS
    sleep_map = {"very_bad": 16, "bad": 12, "average": 7, "good": 3, "very_good": 1}
    sleep_score = sleep_map.get(answers.get("sleepQuality", "average"), 7)

    # Stress level -> affects HADS anxiety
    stress_map = {"very_high": 18, "high": 14, "moderate": 8, "low": 4, "very_low": 1}
    stress_score = stress_map.get(answers.get("stressLevel", "moderate"), 8)

    # Screen time -> adds to attention deficit
    screen_map = {"1-2": 0, "3-4": 5, "5-6": 10, "7-8": 15, "9+": 20}
    screen_add = screen_map.get(answers.get("screenTime", "3-4"), 5)

    # Challenge-based scoring
    has_focus = "focus" in challenges
    has_hyperactivity = "hyperactivity" in challenges
    has_organization = "organization" in challenges
    has_procrastination = "procrastination" in challenges
    has_anxiety = "anxiety" in challenges
    has_memory = "memory" in challenges
    has_motivation = "motivation" in challenges

    # WURS (childhood ADHD retrospective) - estimate from current symptoms
    wurs = min(100, focus_score + screen_add
               + (15 if has_focus else 0)
               + (12 if has_hyperactivity else 0)
               + (10 if has_organization else 0)
               + (8 if has_procrastination else 0)
               + (5 if has_memory else 0))

    # ASRS (current adult ADHD)
    asrs = min(72, int(focus_score * 0.8) + screen_add
               + (10 if has_focus else 0)
               + (8 if has_hyperactivity else 0)
               + (6 if has_organization else 0)
               + (5 if has_procrastination else 0)
               + (4 if has_memory else 0)
               + (3 if has_motivation else 0))

    # HADS Anxiety
    hads_a = min(21, int(stress_score * 0.6) + (5 if has_anxiety else 0))

    # HADS Depression
    hads_d = min(21, int(sleep_score * 0.4) + (3 if has_motivation else 0))

    # MADRS depression
    madrs = min(60, sleep_score + hads_d + (5 if has_motivation else 0))

    features = {
        "SEX": sex_val,
        "AGE": age_code,
        "WURS": wurs,
        "ASRS": asrs,
        "MADRS": madrs,
        "HADS_A": hads_a,
        "HADS_D": hads_d,
        "ADD": 0,
        "BIPOLAR": 0,
        "UNIPOLAR": 0,
        "ANXIETY": 1 if has_anxiety else 0,
        "SUBSTANCE": 0,
        "OTHER": 0,
    }

    result = predictor.predict_adult(features)
    result["subscores"] = {
        "wurs_childhood": wurs,
        "asrs_current": asrs,
        "anxiety": hads_a,
        "depression": hads_d,
        "focus_score": focus_score,
    }
    return result
