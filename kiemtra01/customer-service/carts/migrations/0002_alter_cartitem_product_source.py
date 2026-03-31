from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("carts", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="cartitem",
            name="product_source",
            field=models.CharField(
                choices=[("laptop", "Laptop"), ("mobile", "Mobile"), ("clothes", "Clothes")],
                max_length=20,
            ),
        ),
    ]
