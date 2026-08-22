from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone

from .models import EventFeedback, EventBlackBoxReport
from .serializers import (
    EventFeedbackSerializer, EventFeedbackCreateSerializer,
    BlackBoxReportSerializer,
)
from events.models import Event
from bookings.models import Booking


class EventFeedbackViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return EventFeedback.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return EventFeedbackCreateSerializer
        return EventFeedbackSerializer

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        Event.sync_statuses()
        if event.status != 'COMPLETED':
            return Response(
                {"detail": "Feedback can only be submitted for completed events"},
                status=status.HTTP_400_BAD_REQUEST
            )

        has_booking = Booking.objects.filter(
            user=request.user,
            event=event,
            status='CONFIRMED'
        ).exists()

        if not has_booking:
            return Response(
                {"detail": "You must have a confirmed booking to submit feedback"},
                status=status.HTTP_403_FORBIDDEN
            )

        if EventFeedback.objects.filter(
            user=request.user, event=event
        ).exists():
            return Response(
                {"detail": "You have already submitted feedback for this event"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def event_feedbacks(self, request):
        event_id = request.query_params.get('event_id')
        if not event_id:
            return Response(
                {"detail": "event_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        feedbacks = EventFeedback.objects.filter(event_id=event_id)
        serializer = EventFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_feedbacks(self, request):
        feedbacks = EventFeedback.objects.filter(user=request.user)
        serializer = EventFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def feedback_stats(self, request):
        event_id = request.query_params.get('event_id')
        if not event_id:
            return Response(
                {"detail": "event_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        feedbacks = EventFeedback.objects.filter(event_id=event_id)
        total = feedbacks.count()

        if total == 0:
            return Response({
                'total': 0,
                'average_rating': 0,
                'sentiment': {'positive': 0, 'neutral': 0, 'negative': 0},
                'top_positive': [],
                'top_problems': [],
            })

        avg_rating = feedbacks.aggregate(Avg('rating'))['rating__avg']

        positive = feedbacks.filter(rating__gte=4).count()
        neutral = feedbacks.filter(rating=3).count()
        negative = feedbacks.filter(rating__lte=2).count()

        pos_pct = round((positive / total) * 100, 1) if total else 0
        neu_pct = round((neutral / total) * 100, 1) if total else 0
        neg_pct = round((negative / total) * 100, 1) if total else 0

        all_positive = []
        for fb in feedbacks:
            all_positive.extend(fb.positive_feedback or [])

        all_problems = []
        for fb in feedbacks:
            all_problems.extend(fb.problems or [])

        from collections import Counter
        pos_counter = Counter(all_positive).most_common(5)
        prob_counter = Counter(all_problems).most_common(5)

        return Response({
            'total': total,
            'average_rating': round(avg_rating, 2),
            'sentiment': {
                'positive': pos_pct,
                'neutral': neu_pct,
                'negative': neg_pct,
            },
            'top_positive': [{'key': k, 'count': c} for k, c in pos_counter],
            'top_problems': [{'key': k, 'count': c} for k, c in prob_counter],
        })


class BlackBoxReportViewSet(viewsets.ModelViewSet):
    serializer_class = BlackBoxReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return EventBlackBoxReport.objects.all()
        if user.role == 'ORGANIZER':
            return EventBlackBoxReport.objects.filter(event__organizer=user)
        return EventBlackBoxReport.objects.filter(
            event__bookings__user=user,
            event__bookings__status='CONFIRMED'
        ).distinct()

    @action(detail=False, methods=['GET'])
    def organizer_reports(self, request):
        if request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        reports = EventBlackBoxReport.objects.filter(
            event__organizer=request.user
        ).select_related('event').order_by('-generated_at')

        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def platform_analytics(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        from events.models import Category

        Event.sync_statuses()
        total_events = Event.objects.count()
        completed_events = Event.objects.filter(status='COMPLETED').count()
        upcoming_events = Event.objects.filter(status='UPCOMING').count()

        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(status='CONFIRMED').count()
        cancelled_bookings = Booking.objects.filter(status='CANCELLED').count()
        pending_bookings = Booking.objects.filter(status='PENDING').count()

        total_revenue = float(
            sum(b.total_price for b in Booking.objects.filter(status='CONFIRMED'))
        )

        from community.models import EventExperience
        from django.db.models import Max

        experience_stats = EventExperience.objects.aggregate(
            avg_rating=Avg('rating'),
            total_experiences=Count('id'),
        )
        overall_avg_rating = experience_stats['avg_rating']
        total_experiences = experience_stats['total_experiences']

        positive = EventExperience.objects.filter(rating__gte=4).count()
        neutral = EventExperience.objects.filter(rating=3).count()
        negative = EventExperience.objects.filter(rating__lte=2).count()
        total_sentiment = positive + neutral + negative or 1

        pos_pct = round((positive / total_sentiment) * 100, 1)
        neu_pct = round((neutral / total_sentiment) * 100, 1)
        neg_pct = round((negative / total_sentiment) * 100, 1)

        all_positive = []
        all_problems = []
        for fb in EventFeedback.objects.all():
            all_positive.extend(fb.positive_feedback or [])
            all_problems.extend(fb.problems or [])

        from collections import Counter
        success_counter = Counter(all_positive).most_common(10)
        problem_counter = Counter(all_problems).most_common(10)

        success_rate = 0
        if total_events > 0:
            success_events = Event.objects.annotate(
                avg_rating=Avg('experiences__rating')
            ).filter(avg_rating__gte=3.5).count()
            success_rate = round((success_events / total_events) * 100, 1)

        category_perf = Event.objects.annotate(
            avg_rating=Avg('experiences__rating'),
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            total_revenue=Sum(
                'bookings__total_price',
                filter=Q(bookings__status='CONFIRMED')
            ),
        ).filter(avg_rating__isnull=False).order_by('-avg_rating')[:10]

        category_performance = [
            {
                'category': c.category.name if c.category else 'Uncategorized',
                'avg_rating': round(c.avg_rating, 2),
                'events': 1,
                'bookings': c.booking_count,
                'revenue': float(c.total_revenue or 0),
            }
            for c in category_perf
        ]

        return Response({
            'total_reports': total_experiences,
            'overall_avg_rating': round(overall_avg_rating, 2) if overall_avg_rating else 0,
            'overall_sentiment': {
                'positive': pos_pct,
                'neutral': neu_pct,
                'negative': neg_pct,
            },
            'top_success_factors': [{'key': k, 'count': c} for k, c in success_counter],
            'common_problems': [{'key': k, 'count': c} for k, c in problem_counter],
            'success_rate': success_rate,
            'category_performance': category_performance,
            'total_events': total_events,
            'completed_events': completed_events,
            'upcoming_events': upcoming_events,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'pending_bookings': pending_bookings,
            'total_revenue': total_revenue,
        })

    @action(detail=True, methods=['POST'])
    def generate_report(self, request, pk=None):
        Event.sync_statuses()
        event = Event.objects.get(pk=pk)

        if event.status != 'COMPLETED':
            return Response(
                {"detail": "Reports can only be generated for completed events"},
                status=status.HTTP_400_BAD_REQUEST
            )

        feedbacks = EventFeedback.objects.filter(event=event)
        total_feedbacks = feedbacks.count()

        if total_feedbacks == 0:
            return Response(
                {"detail": "No feedback available for this event yet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        actual_attendees = Booking.objects.filter(
            event=event, status='CONFIRMED'
        ).aggregate(total=Sum('number_of_tickets'))['total'] or 0

        avg_rating = feedbacks.aggregate(Avg('rating'))['rating__avg'] or 0

        positive = feedbacks.filter(rating__gte=4).count()
        neutral = feedbacks.filter(rating=3).count()
        negative = feedbacks.filter(rating__lte=2).count()

        pos_pct = round((positive / total_feedbacks) * 100, 1)
        neu_pct = round((neutral / total_feedbacks) * 100, 1)
        neg_pct = round((negative / total_feedbacks) * 100, 1)

        all_positive = []
        all_problems = []
        all_suggestions = []
        for fb in feedbacks:
            all_positive.extend(fb.positive_feedback or [])
            all_problems.extend(fb.problems or [])
            if fb.suggestions:
                all_suggestions.append(fb.suggestions)

        from collections import Counter
        success_factors = [item for item, _ in Counter(all_positive).most_common(5)]
        problems_found = [item for item, _ in Counter(all_problems).most_common(5)]

        PROBLEM_LABELS = {
            'LATE_START': 'Events starting late',
            'POOR_MANAGEMENT': 'Poor event management',
            'TOO_CROWDED': 'Venue too crowded',
            'HIGH_PRICE': 'Ticket price too high',
            'POOR_LOCATION': 'Inconvenient venue location',
            'TECHNICAL_ISSUES': 'Technical issues during event',
            'OTHER': 'Other issues reported',
        }

        POSITIVE_LABELS = {
            'VENUE': 'Great venue quality',
            'SPEAKER': 'Excellent speaker quality',
            'ACTIVITIES': 'Engaging activities',
            'ORGANIZATION': 'Well-organized event',
            'NETWORKING': 'Good networking opportunities',
        }

        problems_labeled = [PROBLEM_LABELS.get(p, p) for p in problems_found]
        success_labeled = [POSITIVE_LABELS.get(s, s) for s in success_factors]

        recommendations = []
        if 'LATE_START' in problems_found:
            recommendations.append('Improve event scheduling and start on time')
        if 'POOR_MANAGEMENT' in problems_found:
            recommendations.append('Enhance event coordination and staff training')
        if 'TOO_CROWDED' in problems_found:
            recommendations.append('Better capacity management or larger venues')
        if 'HIGH_PRICE' in problems_found:
            recommendations.append('Consider more competitive pricing')
        if 'POOR_LOCATION' in problems_found:
            recommendations.append('Choose more accessible venue locations')
        if 'TECHNICAL_ISSUES' in problems_found:
            recommendations.append('Invest in better technical equipment and backup plans')
        if avg_rating >= 4.0:
            recommendations.append('Maintain current quality standards')
        if pos_pct > 70:
            recommendations.append('Leverage strengths in marketing for future events')

        category_stats = {}
        if event.category:
            cat_avg = EventBlackBoxReport.objects.filter(
                event__category=event.category
            ).aggregate(Avg('average_rating'))['average_rating__avg']
            category_stats = {
                'category_name': event.category.name,
                'category_avg_rating': round(cat_avg, 2) if cat_avg else 0,
            }

        report, created = EventBlackBoxReport.objects.update_or_create(
            event=event,
            defaults={
                'expected_attendees': event.total_seats,
                'actual_attendees': actual_attendees,
                'total_feedbacks': total_feedbacks,
                'average_rating': round(avg_rating, 2),
                'sentiment_positive': pos_pct,
                'sentiment_neutral': neu_pct,
                'sentiment_negative': neg_pct,
                'success_factors': success_labeled,
                'problems_found': problems_labeled,
                'recommendations': recommendations,
                'category_stats': category_stats,
            }
        )

        serializer = BlackBoxReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
