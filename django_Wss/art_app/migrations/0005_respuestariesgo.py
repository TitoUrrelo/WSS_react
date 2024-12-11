# Generated by Django 5.1 on 2024-11-19 04:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('art_app', '0004_alter_art_art_fecha'),
        ('personal_app', '0002_empleado_emp_actividad'),
    ]

    operations = [
        migrations.CreateModel(
            name='RespuestaRiesgo',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('pregunta_numero', models.IntegerField()),
                ('respuesta', models.BooleanField()),
                ('art', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='art_app.art')),
                ('empleado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='personal_app.empleado')),
                ('riesgo_critico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='art_app.riesgocritico')),
            ],
        ),
    ]