# Garbhotsav API Documentation

Base URL: `http://localhost:3000/api`

Protected APIs require:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Auth APIs

### 1. Login Request OTP

`POST /api/auth/login/request-otp`

Payload:

```json
{
  "identifier": "9876543210"
}
```

Sample response:

```json
{
  "success": true,
  "message": "OTP sent for login",
  "data": {
    "identifier": "9876543210",
    "expires_at": "2026-03-21T16:30:12.452Z",
    "otp_preview": "623941",
    "lookup_identifier": "9876543210"
  }
}
```

### 2. Login Verify OTP

`POST /api/auth/login/verify-otp`

Payload:

```json
{
  "identifier": "9876543210",
  "otp_code": "623941"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "TOKEN_HERE",
    "expires_at": "2026-04-20T16:20:12.000Z",
    "user": {
      "id": "cf39d402-f3d1-4e67-b95e-2e7203263771",
      "full_name": "Khush Patel",
      "phone_number": "9876543210"
    }
  }
}
```

## Dashboard APIs

### 3. Dashboard

`GET /api/dashboard/me`

Sample response:

```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "greeting": "Good Evening 🌙",
    "name": "Khush",
    "pregnancy": {
      "day": 26,
      "week": 4,
      "message": "Day 26 of Your Pregnancy Journey 💛"
    },
    "user_information": {
      "full_name": "Khush Patel",
      "phone_number": "9876543210",
      "email": null,
      "due_date": "2026-12-01T00:00:00.000Z",
      "pregnancy_start_date": "2026-02-24T00:00:00.000Z"
    },
    "activities": []
  }
}
```

## Daily Activity APIs

### 4. Get Today Activities

`GET /api/daily-activities/today`

Sample response:

```json
{
  "success": true,
  "message": "Daily activities fetched successfully",
  "data": {
    "user": {
      "id": "cf39d402-f3d1-4e67-b95e-2e7203263771",
      "full_name": "Khush Patel"
    },
    "pregnancy": {
      "day": 26,
      "week": 4
    },
    "sessions": {
      "morning": [],
      "afternoon": [],
      "evening": []
    }
  }
}
```

### 5. Get Activities By Day

`GET /api/daily-activities/day/:dayNumber`

Example:

`GET /api/daily-activities/day/112`

Sample response:

```json
{
  "success": true,
  "message": "Daily activities fetched successfully",
  "data": {
    "day": 112,
    "week": 16,
    "due_date": "2026-12-01T00:00:00.000Z",
    "sessions": {
      "morning": [],
      "afternoon": [],
      "evening": []
    }
  }
}
```

### 6. Mark Activity Completed

`POST /api/daily-activities/complete`

Payload:

```json
{
  "day_number": 26,
  "activity_id": "meditation",
  "session": "morning",
  "is_completed": true
}
```

Sample response:

```json
{
  "success": true,
  "message": "Activity status updated successfully",
  "data": {
    "message": "Activity marked as completed",
    "completion": {
      "activity_id": "meditation",
      "session": "morning",
      "is_completed": true
    },
    "sessions": {
      "morning": [],
      "afternoon": [],
      "evening": []
    }
  }
}
```

## Profile APIs

### 7. Get Profile

`GET /api/profile/me`

Sample response:

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "cf39d402-f3d1-4e67-b95e-2e7203263771",
    "full_name": "Khush Patel",
    "phone_number": "9876543210",
    "email": null,
    "device_id": "device_123",
    "is_active": true,
    "pregnancy_profile": {
      "due_date": "2026-12-01T00:00:00.000Z",
      "pregnancy_start_date": "2026-02-24T00:00:00.000Z",
      "baby_name": "Little Star",
      "doctor_name": "Dr. Mehta",
      "hospital_name": "Sunrise Hospital"
    }
  }
}
```

### 8. Update Profile

`PATCH /api/profile/me`

Payload:

```json
{
  "baby_name": "Little Star",
  "hospital_name": "Sunrise Hospital",
  "doctor_name": "Dr. Mehta"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "pregnancy_profile": {
      "baby_name": "Little Star",
      "doctor_name": "Dr. Mehta",
      "hospital_name": "Sunrise Hospital"
    }
  }
}
```

## Event APIs

  ### 9. Get All Events

  `GET /api/user-events`

  Sample response:

  ```json
  {
    "success": true,
    "message": "Events fetched successfully",
    "data": [
      {
        "id": "53e5e915-abce-4fc4-882c-ef8b408a7d24",
        "title": "Prenatal Yoga Session",
        "description": "A calming guided yoga class for expecting mothers.",
        "event_date": "2026-03-25T10:00:00.000Z",
        "join_link": "https://example.com/prenatal-yoga",
        "is_active": true,
        "is_registered": false,
        "registered_at": null
      }
    ]
  }
  ```

### 10. Register For Event

`POST /api/user-events/register`

Payload:

```json
{
  "event_id": "53e5e915-abce-4fc4-882c-ef8b408a7d24"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Event registered successfully",
  "data": {
    "message": "Event registration completed successfully",
    "registration": {
      "event_id": "53e5e915-abce-4fc4-882c-ef8b408a7d24"
    },
    "event": {
      "title": "Prenatal Yoga Session",
      "join_link": "https://example.com/prenatal-yoga"
    }
  }
}
```

## Admin APIs

### Admin Login

`POST /api/admin/auth/login`

Payload:

```json
{
  "email": "admin@garbhotsav.com",
  "password": "admin123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "access_token": "ADMIN_TOKEN_HERE",
    "expires_at": "2026-04-20T16:56:39.000Z",
    "admin": {
      "id": "871a5170-4309-4cd3-9652-32cebedff917",
      "name": "Super Admin",
      "email": "admin@garbhotsav.com",
      "role": "super_admin"
    }
  }
}
```

Use this header for admin APIs:

```http
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Admin Events

- `GET /api/admin/events`
- `GET /api/admin/events/:id`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:id`
- `DELETE /api/admin/events/:id`

Create payload:

```json
{
  "title": "Admin Event",
  "description": "Created by admin API",
  "event_date": "2026-04-01T10:00:00.000Z",
  "join_link": "https://example.com/admin-event",
  "is_active": true
}
```

Create sample response:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "ee9c0fb5-86a8-4de2-b9c2-b17b18ba8edb",
    "title": "Admin Event",
    "description": "Created by admin API",
    "event_date": "2026-04-01T10:00:00.000Z",
    "join_link": "https://example.com/admin-event",
    "is_active": true
  }
}
```

Update payload:

```json
{
  "title": "Admin Event Updated"
}
```

Delete response:

```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": {
    "id": "ee9c0fb5-86a8-4de2-b9c2-b17b18ba8edb",
    "title": "Admin Event Updated"
  }
}
```

### Admin Pregnancy Day Content

- `GET /api/admin/pregnancy-day-content`
- `GET /api/admin/pregnancy-day-content/:id`
- `POST /api/admin/pregnancy-day-content`
- `PATCH /api/admin/pregnancy-day-content/:id`
- `DELETE /api/admin/pregnancy-day-content/:id`

Create payload:

```json
{
  "day_number": 280,
  "meditation_title": "Special Meditation",
  "meditation_url": "https://example.com/meditation",
  "music_url": "https://example.com/music",
  "reading_content": "Reading",
  "affirmation": "I am calm",
  "tips": "Stay hydrated"
}
```

Create sample response:

```json
{
  "success": true,
  "message": "Pregnancy day content created successfully",
  "data": {
    "id": "0aa07c35-3916-4379-856a-12fd4b0b10d7",
    "day_number": 280,
    "meditation_title": "Special Meditation",
    "affirmation": "I am calm"
  }
}
```

Update payload:

```json
{
  "affirmation": "I am peaceful and strong"
}
```

Delete response:

```json
{
  "success": true,
  "message": "Pregnancy day content deleted successfully",
  "data": {
    "id": "0aa07c35-3916-4379-856a-12fd4b0b10d7",
    "day_number": 280
  }
}
```

## Recommended API Order For App

1. `POST /api/auth/login/request-otp`
2. `POST /api/auth/login/verify-otp`
3. `GET /api/dashboard/me`
4. `GET /api/daily-activities/today`
5. `GET /api/profile/me`
6. `GET /api/user-events`

## Admin Test Credentials

- Email: `admin@garbhotsav.com`
- Password: `admin123`

## Notes

- OTP preview is shown in non-production mode.
- Daily activity completion is stored in the database.
- Dashboard activities come from `pregnancy_day_content`.
- Event registration status is user-specific.
- Admin APIs use `admin_users` and a separate admin token.
- I fixed a shared CRUD update bug so updates no longer regenerate record IDs.
#   G a r b h o s t s a v _ b a c k e n d  
 