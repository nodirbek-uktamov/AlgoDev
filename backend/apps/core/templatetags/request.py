from django import template
register = template.Library()


@register.simple_tag(takes_context=True)
def domain(context):
    return context['request'].get_host().split(':')[0]
