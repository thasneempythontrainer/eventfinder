from rest_framework.pagination import PageNumberPagination


class NotificationPagination(PageNumberPagination):
    """Honours the ?page_size= query parameter.

    The project's REST_FRAMEWORK block sets PAGE_SIZE_QUERY_PARAM, but DRF only
    reads the class attribute, so ?page_size= was silently ignored. The
    notifications page needs to control the size, and an unbounded page_size
    lets a caller ask for the whole table at once.
    """

    page_size_query_param = "page_size"
    max_page_size = 100
