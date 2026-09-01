from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from anthropic import Anthropic

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    user_message = request.data.get("message")

    if not user_message:
        return Response(
            {"error": "Message is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",  # Latest Claude Sonnet model
            max_tokens=1024,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        reply = response.content[0].text

        return Response(
            {"reply": reply},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "error": "AI request failed",
                "details": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )