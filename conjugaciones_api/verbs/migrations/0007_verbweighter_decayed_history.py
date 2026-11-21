from django.db import migrations, models


def backfill_decayed_history(apps, schema_editor):
    """Seed recency-weighted history from lifetime totals so existing users keep their progress."""
    VerbWeighter = apps.get_model('verbs', 'VerbWeighter')
    for vw in VerbWeighter.objects.filter(times_seen__gt=0).iterator():
        attempts = vw.total_correct + vw.total_incorrect
        if not attempts:
            continue
        vw.decayed_count = float(min(vw.times_seen, 3))
        vw.decayed_score = vw.decayed_count * vw.total_correct / attempts
        vw.save(update_fields=['decayed_count', 'decayed_score'])


class Migration(migrations.Migration):

    dependencies = [
        ('verbs', '0006_auto_20200511_0438'),
    ]

    operations = [
        migrations.AddField(
            model_name='verbweighter',
            name='decayed_count',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='verbweighter',
            name='decayed_score',
            field=models.FloatField(default=0.0),
        ),
        migrations.RunPython(backfill_decayed_history, migrations.RunPython.noop),
    ]
