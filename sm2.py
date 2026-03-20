from datetime import datetime, timedelta

def sm2(easiness, interval, repetitions, quality):
    if quality < 3:
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * easiness)
        repetitions += 1

    easiness = easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    next_review = (datetime.now() + timedelta(days=interval)).strftime("%Y-%m-%d")
    easiness = max(1.3, easiness)
    return easiness, interval, next_review
