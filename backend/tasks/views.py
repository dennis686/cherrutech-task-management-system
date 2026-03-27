from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=False, methods=["get"])
    def completed(self, request):
        completed_tasks = Task.objects.filter(completed=True)
        serializer = self.get_serializer(completed_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        pending_tasks = Task.objects.filter(completed=False)
        serializer = self.get_serializer(pending_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def high_priority(self, request):
        high_priority_tasks = Task.objects.filter(priority="high", completed=False)
        serializer = self.get_serializer(high_priority_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        total = Task.objects.count()
        completed = Task.objects.filter(completed=True).count()
        pending = Task.objects.filter(completed=False).count()
        high_priority = Task.objects.filter(priority="high", completed=False).count()

        return Response(
            {
                "total": total,
                "completed": completed,
                "pending": pending,
                "high_priority": high_priority,
                "completion_percentage": (completed / total * 100) if total > 0 else 0,
            }
        )


@api_view(["POST"])
def support_ticket(request):
    subject = (request.data.get("subject") or "").strip()
    message = (request.data.get("message") or "").strip()
    email = (request.data.get("email") or "").strip()

    if not subject or not message:
        return Response(
            {"error": "Subject and message are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Support request received.",
            "ticket": {
                "subject": subject,
                "email": email,
            },
        },
        status=status.HTTP_201_CREATED,
    )
