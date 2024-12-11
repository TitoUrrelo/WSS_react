# Generated by Django 5.1 on 2024-11-21 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('art_app', '0010_rename_art_supervisor_art_art_supervisor_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='art',
            name='art_comunicAccions',
            field=models.BooleanField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='art',
            name='art_contextTrabSim',
            field=models.TextField(default='', max_length=150),
        ),
        migrations.AddField(
            model_name='art',
            name='art_coordLider',
            field=models.BooleanField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='art',
            name='art_verfControles',
            field=models.BooleanField(default=''),
            preserve_default=False,
        ),
    ]