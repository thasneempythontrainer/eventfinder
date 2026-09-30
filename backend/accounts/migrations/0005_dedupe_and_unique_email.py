from django.db import migrations, models


def dedupe_emails(apps, schema_editor):
    """Delete duplicate accounts, keeping the oldest of each email group.

    Runs before the unique index is added so the AlterField below cannot fail
    on pre-existing duplicates. Comparison is case-insensitive to match the
    collation of the unique index.
    """
    User = apps.get_model("accounts", "User")

    seen = set()
    doomed = []

    for pk, email in User.objects.order_by("pk").values_list("pk", "email"):
        key = (email or "").strip().lower()
        if key in seen:
            doomed.append(pk)
        else:
            seen.add(key)

    if doomed:
        User.objects.filter(pk__in=doomed).delete()


def noop(apps, schema_editor):
    """Deleted accounts cannot be restored; keep the constraint on reverse."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_organizerprofile_description'),
    ]

    operations = [
        migrations.RunPython(
            dedupe_emails,
            noop,
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, unique=True),
        ),
    ]
