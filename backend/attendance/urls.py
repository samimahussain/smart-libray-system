from django.urls import path
from .views import (
    # New QR / email-based flows
    generate_qr_codes,
    scan_entry,
    scan_exit,
    librarian_mark_entry,
    librarian_mark_exit,
    AttendanceListView,

    # Legacy (kept for backward compat)
    mark_entry,
    mark_exit,
)

urlpatterns = [
    # ── QR codes ──────────────────────────────
    path('qr-codes/', generate_qr_codes, name='generate-qr-codes'),

    # ── Student self-serve (via QR scan) ──────
    path('scan/entry/', scan_entry, name='scan-entry'),
    path('scan/exit/',  scan_exit,  name='scan-exit'),

    # ── Librarian manual override ──────────────
    path('librarian/entry/', librarian_mark_entry, name='librarian-entry'),
    path('librarian/exit/',  librarian_mark_exit,  name='librarian-exit'),

    # ── List view ─────────────────────────────
    path('', AttendanceListView.as_view(), name='attendance-list'),

    # ── Legacy ────────────────────────────────
    path('entry/',          mark_entry,        name='mark-entry'),
    path('exit/<int:pk>/',  mark_exit,         name='mark-exit'),
]
