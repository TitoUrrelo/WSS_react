# Generated by Django 5.1 on 2024-12-22 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('art_app', '0012_art_art_estado_super'),
    ]

    operations = [
        migrations.AlterField(
            model_name='art',
            name='art_contextTrabSim',
            field=models.TextField(default='', max_length=250),
        ),
    ]
