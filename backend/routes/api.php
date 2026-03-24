<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\EquipmentReservationController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\LabReservationController;
use App\Http\Controllers\Api\MeetingRoomController;
use App\Http\Controllers\Api\MeetingRoomReservationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MaintenanceRequestController;
use App\Http\Controllers\Api\PartsRequestController;
use App\Http\Controllers\Api\ComponentInventoryController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Equipment
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::get('/equipment/available', [EquipmentController::class, 'available']);
    Route::get('/equipment/search', [EquipmentController::class, 'search']);
    Route::get('/equipment/category/{category}', [EquipmentController::class, 'byCategory']);
    Route::get('/equipment/{id}', [EquipmentController::class, 'show']);
    Route::post('/equipment', [EquipmentController::class, 'store']);
    Route::put('/equipment/{id}', [EquipmentController::class, 'update']);
    Route::delete('/equipment/{id}', [EquipmentController::class, 'destroy']);

    // Checkouts
    Route::get('/checkouts', [CheckoutController::class, 'index']);
    Route::get('/checkouts/active', [CheckoutController::class, 'active']);
    Route::get('/checkouts/overdue', [CheckoutController::class, 'overdue']);
    Route::get('/checkouts/stats', [CheckoutController::class, 'stats']);
    Route::get('/checkouts/user/{userId}', [CheckoutController::class, 'userCheckouts']);
    Route::get('/checkouts/user/{userId}/active', [CheckoutController::class, 'userActiveCheckouts']);
    Route::get('/checkouts/qr/{qrCode}', [CheckoutController::class, 'getByQrCode']);
    Route::get('/checkouts/{id}', [CheckoutController::class, 'show']);
    Route::post('/checkouts', [CheckoutController::class, 'store']);
    Route::put('/checkouts/{id}/checkin', [CheckoutController::class, 'checkin']);
    Route::post('/checkouts/qr-checkin', [CheckoutController::class, 'qrCheckin']);

    // Equipment Reservations
    Route::get('/equipment-reservations', [EquipmentReservationController::class, 'index']);
    Route::get('/equipment-reservations/stats', [EquipmentReservationController::class, 'stats']);
    Route::get('/equipment-reservations/{id}', [EquipmentReservationController::class, 'show']);
    Route::post('/equipment-reservations', [EquipmentReservationController::class, 'store']);
    Route::put('/equipment-reservations/{id}', [EquipmentReservationController::class, 'update']);
    Route::put('/equipment-reservations/{id}/approve', [EquipmentReservationController::class, 'approve']);
    Route::put('/equipment-reservations/{id}/reject', [EquipmentReservationController::class, 'reject']);
    Route::put('/equipment-reservations/{id}/cancel', [EquipmentReservationController::class, 'cancel']);

    // Labs
    Route::get('/labs', [LabController::class, 'index']);
    Route::get('/labs/stats', [LabController::class, 'stats']);
    Route::get('/labs/{id}', [LabController::class, 'show']);
    Route::post('/labs', [LabController::class, 'store']);
    Route::put('/labs/{id}', [LabController::class, 'update']);
    Route::delete('/labs/{id}', [LabController::class, 'destroy']);

    // Lab Reservations
    Route::get('/lab-reservations', [LabReservationController::class, 'index']);
    Route::post('/lab-reservations', [LabReservationController::class, 'store']);
    Route::put('/lab-reservations/{id}/approve', [LabReservationController::class, 'approve']);
    Route::put('/lab-reservations/{id}/reject', [LabReservationController::class, 'reject']);

    // Meeting Rooms
    Route::get('/meeting-rooms', [MeetingRoomController::class, 'index']);
    Route::get('/meeting-rooms/stats', [MeetingRoomController::class, 'stats']);
    Route::get('/meeting-rooms/{id}', [MeetingRoomController::class, 'show']);
    Route::post('/meeting-rooms', [MeetingRoomController::class, 'store']);
    Route::put('/meeting-rooms/{id}', [MeetingRoomController::class, 'update']);
    Route::delete('/meeting-rooms/{id}', [MeetingRoomController::class, 'destroy']);

    // Meeting Room Reservations
    Route::get('/meeting-room-reservations', [MeetingRoomReservationController::class, 'index']);
    Route::post('/meeting-room-reservations', [MeetingRoomReservationController::class, 'store']);
    Route::put('/meeting-room-reservations/{id}/approve', [MeetingRoomReservationController::class, 'approve']);
    Route::put('/meeting-room-reservations/{id}/reject', [MeetingRoomReservationController::class, 'reject']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}/activity', [UserController::class, 'activity']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/activate', [UserController::class, 'activate']);
    Route::put('/users/{id}/deactivate', [UserController::class, 'deactivate']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Maintenance Requests
    Route::get('/maintenance-requests', [MaintenanceRequestController::class, 'index']);
    Route::get('/maintenance-requests/stats', [MaintenanceRequestController::class, 'stats']);
    Route::get('/maintenance-history', [MaintenanceRequestController::class, 'history']);
    Route::get('/maintenance-requests/{id}', [MaintenanceRequestController::class, 'show']);
    Route::post('/maintenance-requests', [MaintenanceRequestController::class, 'store']);
    Route::put('/maintenance-requests/{id}/claim', [MaintenanceRequestController::class, 'claim']);
    Route::put('/maintenance-requests/{id}/status', [MaintenanceRequestController::class, 'updateStatus']);
    Route::put('/maintenance-requests/{id}/notes', [MaintenanceRequestController::class, 'updateNotes']);
    Route::put('/maintenance-requests/{id}/complete', [MaintenanceRequestController::class, 'complete']);

    // Parts Requests
    Route::get('/parts-requests', [PartsRequestController::class, 'index']);
    Route::get('/parts/stats', [PartsRequestController::class, 'stats']);
    Route::get('/parts/low-stock', [PartsRequestController::class, 'lowStock']);
    Route::get('/parts-requests/{id}', [PartsRequestController::class, 'show']);
    Route::post('/parts-requests', [PartsRequestController::class, 'store']);
    Route::put('/parts-requests/{id}/approve', [PartsRequestController::class, 'approve']);
    Route::put('/parts-requests/{id}/reject', [PartsRequestController::class, 'reject']);
    Route::put('/parts-requests/{id}/cancel', [PartsRequestController::class, 'cancel']);
    Route::put('/parts-requests/{id}/arrived', [PartsRequestController::class, 'markArrived']);

    // Component Inventory
    Route::get('/component-inventory', [ComponentInventoryController::class, 'index']);
    Route::put('/component-inventory/{partName}', [ComponentInventoryController::class, 'update']);
    Route::post('/component-inventory/consume', [ComponentInventoryController::class, 'consume']);

    // Approvals
    Route::get('/approvals', [ApprovalController::class, 'index']);
    Route::get('/approvals/stats', [ApprovalController::class, 'stats']);
    Route::get('/approvals/pending-count', [ApprovalController::class, 'pendingCount']);
    Route::get('/approvals/{id}', [ApprovalController::class, 'show']);
    Route::post('/approvals', [ApprovalController::class, 'store']);
    Route::put('/approvals/{id}/approve', [ApprovalController::class, 'approve']);
    Route::put('/approvals/{id}/reject', [ApprovalController::class, 'reject']);

    // Activity Log
    Route::get('/activity-log', [ActivityLogController::class, 'index']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'clearAll']);
});
