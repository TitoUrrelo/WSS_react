# Generated by Django 5.1 on 2024-11-20 08:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('art_app', '0008_art_pregunta'),
    ]

    operations = [
        migrations.RenameField(
            model_name='artpregunta',
            old_name='respuesta',
            new_name='respuestaTrans',
        ),
    ]
