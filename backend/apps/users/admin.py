from django.contrib import admin
from django.contrib.auth.models import Group
from users.models import User

admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    fields = ('email', 'first_name', 'last_name', 'verified_at')
    list_display = ('email', 'first_name', 'last_name', 'verified_at')
