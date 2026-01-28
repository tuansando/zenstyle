<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Rules\VietnamesePhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    /**
     * PUBLIC: Gửi tin nhắn liên hệ (không cần đăng nhập)
     * Khách truy cập có thể gửi tin nhắn từ trang chủ
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => ['nullable', new VietnamesePhoneNumber],
            'message' => 'required|string|max:2000'
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
            'data' => $contact
        ], 201);
    }

    /**
     * ADMIN/STAFF: Xem danh sách tất cả tin nhắn
     * Có thể lọc theo status: New, Read, Replied, Resolved
     */
    public function index(Request $request)
    {
        $query = Contact::with('repliedByUser:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'message' => 'Contacts retrieved successfully',
            'data' => $contacts
        ]);
    }

    /**
     * ADMIN/STAFF: Xem chi tiết một tin nhắn
     * Tự động đánh dấu là "Read" khi xem
     */
    public function show($id)
    {
        $contact = Contact::with('repliedByUser:id,name,email,role')
            ->findOrFail($id);

        // Auto-mark as Read if status is New
        if ($contact->status === 'New') {
            $contact->update(['status' => 'Read']);
        }

        return response()->json([
            'message' => 'Contact details retrieved successfully',
            'data' => $contact
        ]);
    }

    /**
     * ADMIN/STAFF: Trả lời tin nhắn
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_reply' => 'required|string|max:2000'
        ]);

        $contact = Contact::findOrFail($id);

        $contact->update([
            'admin_reply' => $validated['admin_reply'],
            'replied_by' => Auth::id(),
            'replied_at' => now(),
            'status' => 'Replied'
        ]);

        // Reload relationship
        $contact->load('repliedByUser:id,name,email,role');

        // TODO: Gửi email phản hồi tới khách hàng
        // Mail::to($contact->email)->send(new ContactReplyMail($contact));

        return response()->json([
            'message' => 'Reply sent successfully',
            'data' => $contact
        ]);
    }

    /**
     * ADMIN/STAFF: Cập nhật trạng thái tin nhắn
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:New,Read,Replied,Resolved'
        ]);

        $contact = Contact::findOrFail($id);
        $contact->update($validated);

        return response()->json([
            'message' => 'Contact status updated successfully',
            'data' => $contact
        ]);
    }

    /**
     * ADMIN ONLY: Xóa tin nhắn
     */
    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'message' => 'Contact deleted successfully'
        ]);
    }

    /**
     * ADMIN: Thống kê tin nhắn
     */
    public function statistics()
    {
        $stats = [
            'total_contacts' => Contact::count(),
            'new_contacts' => Contact::where('status', 'New')->count(),
            'read_contacts' => Contact::where('status', 'Read')->count(),
            'replied_contacts' => Contact::where('status', 'Replied')->count(),
            'resolved_contacts' => Contact::where('status', 'Resolved')->count(),
            'today_contacts' => Contact::whereDate('created_at', today())->count(),
            'this_week_contacts' => Contact::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month_contacts' => Contact::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return response()->json([
            'message' => 'Contact statistics retrieved successfully',
            'data' => $stats
        ]);
    }
}
