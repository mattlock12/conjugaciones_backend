# Generated by Django 3.0.5 on 2020-04-27 02:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('verbs', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='verb',
            name='gerund',
            field=models.CharField(max_length=127),
        ),
        migrations.AlterField(
            model_name='verb',
            name='infinitive',
            field=models.CharField(max_length=127, unique=True),
        ),
        migrations.AlterField(
            model_name='verb',
            name='infinitive_english',
            field=models.CharField(max_length=127, unique=True),
        ),
        migrations.AlterField(
            model_name='verb',
            name='past_participle',
            field=models.CharField(max_length=127),
        ),
        migrations.AlterField(
            model_name='verbconjugation',
            name='tense',
            field=models.CharField(max_length=127),
        ),
    ]
